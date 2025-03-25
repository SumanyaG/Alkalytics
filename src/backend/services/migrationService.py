import os
import logging
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import re
import numpy as np


class MigrationService:
    """
    Service class for migrating experimental data from Excel sheets into
    MongoDB, handling dynamic linking, duplicate detection, and user
    interaction for ambiguous links. Supports both automatic linking by
    date and manual user input when ambiguity exists.
    """

    def __init__(self, mongoUri, dbName):
        """
        Initialize the migration service with MongoDB connection details.
        """
        self.client = AsyncIOMotorClient(mongoUri)
        self.db = self.client[dbName]

        self.experimentsCollection = self.db["experiments"]
        self.dataSheetsCollection = self.db["data"]

        self.ambiguousData = []
        
        # Configure logging
        logging.basicConfig(
            filename='migration.log',
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('MigrationService')

    def cleanData(self, df):
        """Clean dataframe by removing empty rows and columns"""
        # Remove rows where all elements are NaN
        df = df.dropna(how="all")
        # Remove rows where all elements are 0
        df = df.loc[~(df == 0).all(axis=1)]
        # Replace NaN values with None for proper MongoDB storage
        df = df.replace({np.nan: None})
        return df
    
    def handle_duplicate_columns(self, df):
        """
        Handle duplicate column names by appending (1), (2), etc.
        Preserves special columns like Notes without creating duplicates.
        """
        col_names = list(df.columns)
        seen = {}
        special_columns_mapping = {
            'notes': 'Notes',
            '#': '#',
            'date': 'Date',
            'time': 'Time'
        }
        
        for i, name in enumerate(col_names):
            name_str = str(name).lower().strip()
            
            # Special handling for notes-like columns
            if name_str in special_columns_mapping:
                # Standardize the name
                col_names[i] = special_columns_mapping[name_str]
                continue
                
            # Now handle real duplicates
            if name in seen:
                j = 1
                base_name = name
                while f"{base_name} ({j})" in seen:
                    j += 1
                new_name = f"{base_name} ({j})"
                col_names[i] = new_name
                seen[new_name] = True
            else:
                seen[name] = True
                
        df.columns = col_names
        return df

    async def isExpDuplicate(self, experimentId):
        """Check if an experiment with this ID already exists in the database"""
        return (
            await self.experimentsCollection.find_one(
                {"experimentId": experimentId}
            )
            is not None
        )

    async def findExperiment(self, date, dataId):
        """
        Attempt to find or prompt the user to link a data sheet to an
        experiment by date.
        """
        try:
            # Normalize date format to ensure consistent matching
            if isinstance(date, str):
                # Try to parse as ISO date format
                parsed_date = pd.to_datetime(date).strftime("%Y-%m-%d")
            else:
                parsed_date = date.strftime("%Y-%m-%d")
                
            self.logger.info(f"Looking for experiment with date: {parsed_date}")
            
            matchingExperiments = await self.experimentsCollection.find(
                {"Date": parsed_date}
            ).to_list(None)

            if len(matchingExperiments) == 1:
                return matchingExperiments[0]["experimentId"]
            elif len(matchingExperiments) > 1:
                self.ambiguousData.append(
                    {
                        "dataId": dataId,
                        "matchingExp": [
                            m["experimentId"] for m in matchingExperiments
                        ],
                    }
                )
                return None
            else:
                self.logger.warning(f"No matching experiment found for date: {parsed_date}")
                return None
        except Exception as e:
            self.logger.error(f"Error finding experiment: {e}")
            return None

    async def importExperimentSheet(self, experimentFilePath):
        """Import and process an experiment sheet, detecting duplicates
        and ambiguous dates."""
        try:
            self.logger.info(f"Importing experiment sheet: {experimentFilePath}")
            
            # Try to read the Excel file with various header configurations
            try:
                expDf = pd.read_excel(
                    experimentFilePath, sheet_name=0, header=[0, 1]
                )
                
                # Combine the two header rows in a smart way
                new_columns = []
                for col in expDf.columns:
                    col0, col1 = str(col[0]), str(col[1])
                    
                    # Handle Notes column specially
                    if 'notes' in col0.lower() or 'notes' in col1.lower():
                        new_columns.append('Notes')
                        continue
                    
                    # Handle empty or unnamed columns
                    if pd.isna(col1) or col1.startswith("Unnamed"):
                        new_columns.append(col0)
                    elif pd.isna(col0) or col0.startswith("Unnamed"):
                        new_columns.append(col1)
                    else:
                        # Both columns have content, combine them
                        new_columns.append(f"{col0} {col1}")
                
                expDf.columns = new_columns
                
            except Exception as e:
                self.logger.warning(f"Could not process with multi-index headers, trying single header: {e}")
                # If multi-index header fails, try with a single header row
                expDf = pd.read_excel(experimentFilePath, sheet_name=0)
            
            # Handle duplicate column names
            expDf = self.handle_duplicate_columns(expDf)
            
            # Clean the data without removing any columns
            expDf = self.cleanData(expDf)
            
            # Ensure Date is in correct format
            if 'Date' in expDf.columns:
                try:
                    expDf['Date'] = pd.to_datetime(expDf['Date']).dt.strftime("%Y-%m-%d")
                except Exception as e:
                    self.logger.warning(f"Could not convert Date column to datetime: {e}")
            
            # Add upload timestamp column
            upload_time = datetime.now()
            expDf['Upload Date'] = upload_time
            
            # Print the columns for debugging
            self.logger.info(f"Experiment sheet columns after processing: {expDf.columns.tolist()}")
            
            experiments = []
            for _, row in expDf.iterrows():
                # Skip rows without date
                date_col = None
                for col in expDf.columns:
                    if isinstance(col, str) and 'date' in col.lower() and 'upload' not in col.lower():
                        date_col = col
                        break
                
                if date_col is None:
                    date_col = 'Date'
                
                if date_col not in row or pd.isna(row[date_col]):
                    continue

                experimentData = row.to_dict()
                
                # Create a unique ID using # column and date if available
                if '#' in row and pd.notna(row['#']):
                    experimentId = f"#{row['#']} {row[date_col]}"
                else:
                    # Generate a fallback ID if # column doesn't exist
                    experimentId = f"EXP-{row[date_col]}-{len(experiments) + 1}"

                if await self.isExpDuplicate(experimentId):
                    self.logger.info(
                        (
                            f"Experiment for date {experimentId} with matching"
                            " data already exists; skipping identical entry."
                        )
                    )
                    continue

                experimentDoc = {
                    "experimentId": experimentId,
                    **experimentData,
                }
                experiments.append(experimentDoc)

            if experiments:
                await self.experimentsCollection.insert_many(experiments)
                self.logger.info(f"Successfully imported {len(experiments)} experiments")
                return experiments
            else:
                self.logger.warning("No experiments to import after processing")
                return []
        except Exception as e:
            self.logger.error(
                f"Error processing experiment file {experimentFilePath}: {e}"
            )
            return []

    async def linkData(self, dataDf, experimentId):
        """Link data rows to their matching experiment ID"""
        records = []
        try:
            for _, row in dataDf.iterrows():
                # Create a unique ID for the data row
                if '#' in row and 'Time' in row and pd.notna(row['#']) and pd.notna(row['Time']):
                    rowId = f"#{row['#']} {row['Time']}"
                else:
                    # Generate a fallback ID if required columns don't exist
                    rowId = f"DATA-{len(records) + 1}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
                
                dataDoc = {
                    "dataSheetId": rowId,
                    "experimentId": experimentId,
                    **row.to_dict(),
                }
                records.append(dataDoc)
            return records
        except Exception as e:
            self.logger.error(f"Error linking data: {e}")
            return records

    async def importDataSheet(self, dataFilePath):
        """
        Import and process a data sheet, creating a separate document for each
        row with a matching experiment ID, if applicable.
        """
        try:
            self.logger.info(f"Importing data sheet: {dataFilePath}")
            
            dataDf = pd.read_excel(dataFilePath, sheet_name=0)
            
            # Handle duplicate column names
            dataDf = self.handle_duplicate_columns(dataDf)
            
            dataDf = self.cleanData(dataDf)
            
            # Attempt to determine the date from the Time column
            if 'Time' in dataDf.columns and len(dataDf) > 0:
                try:
                    # Get the date from the first non-null Time entry
                    first_valid_time = None
                    for time_val in dataDf['Time']:
                        if pd.notna(time_val):
                            first_valid_time = time_val
                            break
                    
                    if first_valid_time is not None:
                        date = pd.to_datetime(first_valid_time).date().isoformat()
                    else:
                        self.logger.warning("Could not find valid time value in Time column")
                        date = None
                except Exception as e:
                    self.logger.warning(f"Error extracting date from Time column: {e}")
                    date = None
            else:
                # Try to extract date from filename as fallback
                filename = os.path.basename(dataFilePath)
                date_match = re.search(r'(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}|\d{4}/\d{2}/\d{2})', filename)
                if date_match:
                    date_str = date_match.group(1)
                    try:
                        date = pd.to_datetime(date_str).date().isoformat()
                    except:
                        date = None
                else:
                    date = None
            
            if not date:
                self.logger.warning("Could not determine date from data sheet")
                return None
                
            experimentId = await self.findExperiment(
                date, os.path.basename(dataFilePath)
            )
            
            if not experimentId:
                self.logger.warning(
                    (
                        f"No single matching experiment found for data sheet "
                        f" date {date}. Skipping."
                    )
                )
                return None

            records = await self.linkData(dataDf, experimentId)
            
            if records:
                await self.dataSheetsCollection.insert_many(records)
                self.logger.info(f"Successfully imported {len(records)} data records linked to experiment {experimentId}")
                return records
            else:
                self.logger.warning("No data records to import after processing")
                return None
        except Exception as e:
            self.logger.error(f"Error processing data file {dataFilePath}: {e}")
            return None

    async def migrate(self, experimentFilePaths=None, dataFilePaths=None):
        """
        Run the migration process, importing experiments and data sheets,
        then linking them as needed.
        """
        self.logger.info("Starting migration process")
        results = {
            "experiments_imported": 0,
            "data_sheets_imported": 0,
            "ambiguous_links": 0,
            "errors": 0
        }
        
        if experimentFilePaths:
            for path in experimentFilePaths:
                try:
                    experiments = await self.importExperimentSheet(path)
                    if experiments:
                        results["experiments_imported"] += len(experiments)
                except Exception as e:
                    self.logger.error(f"Failed to import experiment file {path}: {e}")
                    results["errors"] += 1

        if dataFilePaths:
            for path in dataFilePaths:
                try:
                    data_records = await self.importDataSheet(path)
                    if data_records:
                        results["data_sheets_imported"] += 1
                except Exception as e:
                    self.logger.error(f"Failed to import data file {path}: {e}")
                    results["errors"] += 1
        
        self.logger.info(f"Migration completed with results: {results}")
        
        return self.ambiguousData

    async def closeConnection(self):
        """Close the MongoDB client connection."""
        self.client.close()
        self.logger.info("Closed MongoDB connection")
