import os
import logging
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient


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

    def cleanData(self, df):
        df = df.dropna(how="all")
        df = df.loc[~(df == 0).all(axis=1)]
        return df

    async def isExpDuplicate(self, experimentId):
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
        matchingExperiments = await self.experimentsCollection.find(
            {"Date": date}
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
            return None

    async def importExperimentSheet(self, experimentFilePath):
        """Import and process an experiment sheet, detecting duplicates
        and ambiguous dates."""
        try:
            expDf = pd.read_excel(
                experimentFilePath, sheet_name=0, header=[0, 1]
            )

            # Combine the two header rows, ignoring NaN or 'Unnamed' columns
            expDf.columns = [
                (
                    col[1]
                    if col[1] and not col[1].startswith("Unnamed")
                    else col[0]
                )
                for col in expDf.columns
            ]

            # Remove the last two columns
            expDf = expDf.iloc[:, :-2]

            expDf = self.cleanData(expDf)
            expDf["Date"] = expDf["Date"].dt.strftime("%Y-%m-%d")

            experiments = []
            for _, row in expDf.iterrows():
                if pd.isna(row["Date"]):
                    continue

                experimentData = row.to_dict()
                experimentId = "#" + str(row["#"]) + " " + row["Date"]

                if await self.isExpDuplicate(experimentId):
                    logging.info(
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
        except Exception as e:
            logging.error(
                f"Error processing experiment file {experimentFilePath}: {e}"
            )
            return []

    async def linkData(self, dataDf, experimentId):
        records = []
        for _, row in dataDf.iterrows():
            rowId = "#" + str(row["#"]) + " " + str(row["Time"])
            dataDoc = {
                "dataSheetId": rowId,
                "experimentId": experimentId,
                **row.to_dict(),
            }
            records.append(dataDoc)
        return records

    async def importDataSheet(self, dataFilePath):
        """
        Import and process a data sheet, creating a separate document for each
        row with a matching experiment ID, if applicable.
        """
        try:
            dataDf = pd.read_excel(dataFilePath, sheet_name=0)
            dataDf = self.cleanData(dataDf)

            date = str(pd.to_datetime(dataDf["Time"][1]).date().isoformat())
            experimentId = await self.findExperiment(
                date, os.path.basename(dataFilePath)
            )
            if not experimentId:
                logging.warning(
                    (
                        f"No single matching experiment found for data sheet "
                        f" date {date}. Skipping."
                    )
                )
                return None

            records = await self.linkData(dataDf, experimentId)
            
            if records:
                await self.dataSheetsCollection.insert_many(records)
        except Exception as e:
            logging.error(f"Error processing data file {dataFilePath}: {e}")
            return None

    async def migrate(self, experimentFilePaths=None, dataFilePaths=None):
        """
        Run the migration process, importing experiments and data sheets,
        then linking them as needed.
        """
        if experimentFilePaths:
            for path in experimentFilePaths:
                await self.importExperimentSheet(path)

        if dataFilePaths:
            for path in dataFilePaths:
                await self.importDataSheet(path)

        return self.ambiguousData

    async def closeConnection(self):
        """Close the MongoDB client connection."""
        self.client.close()
