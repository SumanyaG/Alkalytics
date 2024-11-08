import pandas as pd
from pymongo import MongoClient
import logging
from datetime import datetime

class MigrationService:
    """
    Service class for migrating experimental data from Excel sheets into MongoDB,
    handling dynamic linking, duplicate detection, and user interaction for ambiguous links.
    Supports both automatic linking by date and manual user input when ambiguity exists.
    """

    def __init__(self, mongoUri, dbName):
        """
        Initialize the migration service with MongoDB connection details.
        Arguments:
            mongoUri (str): MongoDB connection URI.
            dbName (str): Name of the MongoDB database.
        """
        self.client = MongoClient(mongoUri)
        self.db = self.client[dbName]

        self.experimentsCollection = self.db["experiments"]
        self.dataSheetsCollection = self.db["data"]

    def cleanData(self, df):
        df = df.dropna(how="all")  
        df = df.loc[~(df == 0).all(axis=1)]  
        return df

    def isExpDuplicate(self, experimentId):
        return self.experimentsCollection.find_one({"experimentId": experimentId}) is not None

    def promptLink(self, experiments, dataSheetId):
        """
        Prompt the user to manually link a data sheet to one of several matching experiments.
        Arguments:
            experiments (list): List of experiment documents with the same date.
            dataSheetId (str): The ID of the data sheet needing linkage.
        """
        print("\nAmbiguous data sheet link detected. Please match the data sheet to an experiment:")
        for idx, experiment in enumerate(experiments):
            print(f"Option {idx + 1}: Experiment ID {experiment['experimentId']}, Data: {experiment}")

        # Capture and validate user input
        choice = None
        while choice is None:
            try:
                choice = int(input(f"Enter the number corresponding to the correct experiment for Data Sheet {dataSheetId}: "))
                if choice < 1 or choice > len(experiments):
                    print("Invalid choice. Please enter a valid number.")
                    choice = None
            except ValueError:
                print("Invalid input. Please enter a valid number.")

        selectedExperimentId = experiments[choice - 1]["experimentId"]
        
        # Update the chosen experiment document to link the data sheet
        self.experimentsCollection.update_one(
            {"experimentId": selectedExperimentId},
        )

    def findExperiment(self, date, dataId):
        """
        Attempt to find or prompt the user to link a data sheet to an experiment by date.
        Arguments:
            date (str): The date associated with the data sheet.
            dataId (str): The unique ID of the data sheet being linked.
        Returns:
            str: The experiment ID linked to the data sheet, or None if not linked.
        """
        matchingExperiments = list(self.experimentsCollection.find({"Date": date}))

        if len(matchingExperiments) == 1:
            return matchingExperiments[0]["experimentId"]
        elif len(matchingExperiments) > 1:
            print(f"\nMultiple experiments found for date {date}. Please select the correct one:")
            # return self.promptLink(matchingExperiments, dataId)
        else:
            return None

    def importExperimentSheet(self, experimentFilePath): 
        """ Import and process an experiment sheet, detecting duplicates and ambiguous dates.
        Arguments:
            experimentFilePath (str): Path to the Excel experiment sheet.
        Returns:
            list: List of inserted experiment documents.
        """
        try:
            
            expDf = pd.read_excel(experimentFilePath, sheet_name=0, header=[0, 1])

            # Combine the two header rows, ignoring NaN or 'Unnamed' columns
            expDf.columns = [
                col[1] if col[1] and not col[1].startswith("Unnamed") else col[0]
                for col in expDf.columns
            ]

            # Remove the last two columns
            expDf = expDf.iloc[:, :-2]

            expDf = self.cleanData(expDf)
            expDf['Date'] = expDf['Date'].dt.strftime('%Y-%m-%d')

            experiments = []
            for _, row in expDf.iterrows():
                if pd.isna(row['Date']): continue

                experimentData = row.to_dict()
                experimentId = '#' + str(row['#']) + " " + row['Date']

                if self.isExpDuplicate(experimentId):
                    logging.info(f"Experiment for date {experimentId} with matching data already exists; skipping identical entry.")
                    continue

                experimentDoc = {
                    "experimentId": experimentId,
                    **experimentData,
                }
                experiments.append(experimentDoc)


            if experiments:
                self.experimentsCollection.insert_many(experiments)
        except Exception as e:
            logging.error(f"Error processing experiment file {experimentFilePath}: {e}")
            return []

    def importDataSheet(self, dataFilePath):
        """
        Import and process a data sheet, creating a separate document for each row
        with a matching experiment ID, if applicable.
        Arguments:
            dataFilePath (str): Path to the Excel data sheet.
        Returns:
            str: Data sheet ID.
        """
        try:
            dataDf = pd.read_excel(dataFilePath, sheet_name=0)
            dataDf = self.cleanData(dataDf)

            date = str(pd.to_datetime(dataDf['Time'][1]).date().isoformat())
            experimentId = self.findExperiment(date)
            if not experimentId:
                logging.warning(f"No matching experiment found for data sheet date {date}. Skipping.")
                return None

            records = []
            for _, row in dataDf.iterrows():
                rowId = '#' + str(row['#']) + " " + row['Time']

                # TODO: CHECK TO SEE IF ROW IS A DUPLICATE AND SKIP IT

                dataDoc = {
                    "dataSheetId": rowId,
                    "experimentId": experimentId,
                    **row.to_dict()
                }
                records.append(dataDoc)

            if records:
                self.dataSheetsCollection.insert_many(records)
        except Exception as e:
            logging.error(f"Error processing data file {dataFilePath}: {e}")
            return None

    def migrate(self, experimentFilePath=None, dataFilePaths=None):
        """
        Run the migration process, importing experiments and data sheets, then linking them as needed.
        Arguments:
            experimentFilePath (str): Path to the experiment Excel file.
            dataFilePaths (list): List of paths to data sheet Excel files.
        """
        if experimentFilePath:
            self.importExperimentSheet(experimentFilePath)

        if dataFilePaths:
            for dataFilePath in dataFilePaths:
                self.importDataSheet(dataFilePath)

    def closeConnection(self):
        """Close the MongoDB client connection."""
        self.client.close()
