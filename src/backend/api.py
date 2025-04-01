import math
import os
import base64
from typing import Dict, List, Optional
from bson import ObjectId
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime, timedelta

from services.migrationService import MigrationService
from auth.routes import router as authRouter
from efficiencies.efficiencyCalculations import (
    computeCurrentEfficiency,
    computeOverallEfficiency,
    computeReactionEfficiency,
    computeVoltageDropEfficiency
)

load_dotenv()
app = FastAPI(docs_url="/docs")
app.include_router(authRouter)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def getConnection(collection: str):
    mongoUri = os.getenv("CONNECTION_STRING")
    dbName = "alkalyticsDB"
    client = MongoClient(mongoUri)
    db = client[dbName]
    collection = db[collection]
    return {"collection": collection, "client": client}


def sanitizeFilename(filename: str) -> str:
    return "".join(c for c in filename if c.isalnum() or c in (" ", ".", "_")).strip()


def cleanData(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    if isinstance(obj, dict):
        return {k: cleanData(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [cleanData(i) for i in obj]
    return obj


class FilePayload(BaseModel):
    filename: str
    mimetype: str
    content: str


class FilesPayload(BaseModel):
    experimentFiles: list[FilePayload]
    dataFiles: list[FilePayload]

@app.post("/upload")
async def upload(payload: FilesPayload):
    """
    Processes uploaded files for experiment and data categories.
    Decodes base64 content, saves them temporarily, uses MigrationService
    to handle the files, and cleans up resources.
    """
    tempExperimentFiles = []
    tempDataFiles = []

    try:

        def decodeAndSave(filePayload: FilePayload) -> str:
            try:
                file_content = base64.b64decode(filePayload.content)
            except Exception as decode_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid base64 content for file: {filePayload.filename}",) from decode_error

            sanitized_filename = sanitizeFilename(filePayload.filename)
            tempFilePath = os.path.join(os.getcwd(), sanitized_filename)

            with open(tempFilePath, "wb") as temp_file:
                temp_file.write(file_content)

            return tempFilePath

        for file in payload.experimentFiles:
            tempExperimentFiles.append(decodeAndSave(file))

        for file in payload.dataFiles:
            tempDataFiles.append(decodeAndSave(file))

        if not tempExperimentFiles and not tempDataFiles:
            raise HTTPException(
                status_code=400, detail="No valid files provided."
            )

        mongoUri = os.getenv("CONNECTION_STRING")
        dbName = "alkalyticsDB"
        migrationService = MigrationService(mongoUri, dbName)

        try:
            ambiguous_data = await migrationService.migrate(
                experimentFilePaths=tempExperimentFiles,
                dataFilePaths=tempDataFiles,
            )
        finally:
            await migrationService.closeConnection()

        file_map = {file.filename: file for file in payload.dataFiles}

        for data in ambiguous_data:
            if data["dataId"] in file_map:
                data["dataFile"] = file_map[data["dataId"]]

        # Clean up temporary files
        for tempFile in tempExperimentFiles:
            os.remove(tempFile)
        for tempFile in tempDataFiles:
            os.remove(tempFile)

        return {
            "status": "success",
            "message": "Files processed successfully.",
            "ambiguousData": ambiguous_data,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        # Clean up temporary experiment files
        for tempFile in tempExperimentFiles:
            if os.path.exists(tempFile):
                os.remove(tempFile)

        # Clean up temporary data files
        for tempFile in tempDataFiles:
            if os.path.exists(tempFile):
                os.remove(tempFile)

        raise HTTPException(
            status_code=500, detail=f"Error processing files: {str(e)}"
        )


class LinkedDataPayload(BaseModel):
    filename: str
    mimetype: str
    content: str
    linkedId: str


class ManualUploadPayload(BaseModel):
    linkedData: list[LinkedDataPayload]


@app.post("/manual-upload")
async def manualUpload(payload: ManualUploadPayload):
    """
    Processes uploaded files for experiment and data categories.
    Decodes base64 content, saves them temporarily, uses
    MigrationService to handle the files, and cleans up resources.
    """
    tempLinkedDataFiles = []

    try:
        def decodeAndSave(filePayload: LinkedDataPayload) -> dict:
            try:
                file_content = base64.b64decode(filePayload.content)
            except Exception as decode_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid base64 content for file: {filePayload.filename}",
                ) from decode_error

            sanitized_filename = sanitizeFilename(filePayload.filename)
            tempFilePath = os.path.join(os.getcwd(), sanitized_filename)

            with open(tempFilePath, "wb") as temp_file:
                temp_file.write(file_content)

            return {"path": tempFilePath, "linkedId": filePayload.linkedId}

        for file in payload.linkedData:
            tempLinkedDataFiles.append(decodeAndSave(file))

        mongoUri = os.getenv("CONNECTION_STRING")
        dbName = "alkalyticsDB"
        migrationService = MigrationService(mongoUri, dbName)

        try:
            for tempData in tempLinkedDataFiles:
                dataDf = pd.read_excel(tempData["path"], sheet_name=0)
                dataDf = migrationService.cleanData(dataDf)

                records = await migrationService.linkData(
                    dataDf, tempData["linkedId"]
                )

                if records:
                    await migrationService.dataSheetsCollection.insert_many(
                        records
                    )
        finally:
            await migrationService.closeConnection()

        for tempFile in tempLinkedDataFiles:
            if os.path.exists(tempFile["path"]):
                os.remove(tempFile["path"])

        return {
            "status": "success",
            "message": "Files processed successfully.",
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        for tempFile in tempLinkedDataFiles:
            if os.path.exists(tempFile):
                os.remove(tempFile)

        raise HTTPException(
            status_code=500, detail=f"Error processing files: {str(e)}"
        )


class DataAttrs(BaseModel):
    collection: str

@app.post("/getAttrs")
async def getCollectionAttrs(payload: DataAttrs):
    """
    Fetches the attributes of the data in a specified collection
    """
    connection = getConnection(payload.collection)
    collection, client = connection["collection"], connection["client"]

    try:
        data = collection.find_one()
        datalist = list(data)
        if datalist:
            return {"status": "success", "data": datalist}
        else:
            return {"status": "error", "message": "Data points have no attributes."}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
            client.close()


async def fetch_and_process_data(collection, query, projection, client):
    try:
        filteredData = collection.find(query, projection)
        dataList = list(filteredData)
        dataList = [cleanData(item) for item in dataList]

        if not dataList:
            raise HTTPException(status_code=404, detail="Data has no attributes of that name.")
        
        return {"status": "success", "data": dataList}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    finally:
        client.close()


def performAnalysis(data, attributes):
    if len(attributes) != 2:
        raise ValueError("The simple linear regression requires 2 variables.")

    # Check if first item in data for specified attributes have numeric values
    if not isinstance(data[0][attributes[0]], (int, float)) or not isinstance(data[0][attributes[1]], (int, float)):
        raise TypeError("Data is non-numeric. Linear regression cannot be computed.")

    if len(data) > 5000:
        print(
            "Size of data is too large to compute linear regression, "
            "a sample of the original data will be analyzed."
        )
        sample_size = int(len(data) * 0.5)
        indices = np.random.choice(len(data), size=sample_size, replace=False)
        data = [data[i] for i in indices]

    # Split and transform data into numpy arrays based on attributes
    x = np.array([item[attributes[0]] for item in data])
    y = np.array([item[attributes[1]] for item in data])

    # Perform linear regression
    coeffs, residuals, _, _, _ = np.polyfit(x, y, 1, full=True)

    # Calculate R-squared coefficient
    SST = np.sum((y - np.mean(y))**2)
    SSR = residuals[0] if residuals.size > 0 else 0
    R_squared = 1 - (SSR / SST) if SST > 0 else 1
    result = {
        "slope": coeffs[0],
        "intercept": coeffs[1],
        "R_squared": R_squared
    }
    return [result]


class ExperimentFilter(BaseModel):
    collection: str
    attributes: List[str]
    dates: List[str]
    analysis: Optional[bool] = False

@app.post("/filterCollectionData")
async def getFilterCollectionData(payload: ExperimentFilter):
    """
    Fetches the data needed to generate graphs
    """
    
    # Prepare attributes for projection
    attrs = {field: 1 for field in payload.attributes}
    attrs["Date"] = 1

    try:
        # Need to get experimentId from the Dates selected
        if payload.collection == "data" and payload.dates:
            # Get experiment IDs from the "experiments" collection
            experiments_conn = getConnection("experiments")
            experiments_collection, experiments_client = experiments_conn["collection"], experiments_conn["client"]

            experiment_ids = [
                item["experimentId"]
                for item in experiments_collection.find(
                    {"Date": {"$in": payload.dates}}, 
                    {"experimentId": 1, "_id": 0}
                )
            ]
            experiments_client.close()

            if not experiment_ids:
                raise HTTPException(status_code=404, detail="No experiments found for the given dates.")

            # Fetch data from the collection using experiment IDs
            target_conn = getConnection(payload.collection)
            target_collection, target_client = target_conn["collection"], target_conn["client"]

            query = {"experimentId": {"$in": experiment_ids}}
            attrs["experimentId"] = 1
            response = await fetch_and_process_data(target_collection, query, attrs, target_client)

        # Handle all other cases
        else:
            target_conn = getConnection(payload.collection)
            target_collection, target_client = target_conn["collection"], target_conn["client"]

            if len(payload.dates) > 0:
                query = {"Date": {"$in": payload.dates}}
            else:
                query = {}
            response = await fetch_and_process_data(target_collection, query, attrs, target_client)
        # Check if analysis is requested
        if payload.analysis:
            try:
                analysisResults = performAnalysis(response["data"], payload.attributes)
                if analysisResults:
                    response["analysisRes"] = analysisResults
            except Exception as e:
                response["analysisRes"] = "error"
                print(f"Error performing analysis: {e}")
        
        return response
    
    except HTTPException as he:
        raise he
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if target_client:
            target_client.close()


class ExperimentFilter(BaseModel):
    collection: str
    attribute: str
    filterValue: str | int | float

@app.post("/getFilterCollectionDates")
async def getFilterCollectionDates(payload: ExperimentFilter):
    """
    Fetches the dates from filtered value
    """
    
    target_conn = getConnection(payload.collection)
    target_collection, target_client = target_conn["collection"], target_conn["client"]

    try: 
        # Get all dates from given collection 
        if payload.filterValue == "":
            query = {}
        else:
            query = {payload.attribute: payload.filterValue}
        data_list = target_collection.find(query, {"experimentId": 1, "_id": 0})
        data_list = [date['experimentId'].split()[-1] for date in data_list]
        data_list = set(data_list)
        data_list = sorted(list(data_list))

        if not data_list:
            raise HTTPException(status_code=404, detail="There is no date with the given attribute value")
        return {"status": "success", "data": data_list}
    except HTTPException as he:
        raise he
    finally:
        if target_client:
            target_client.close()


class AttributeValues(BaseModel):
    collection: str
    attribute: str

@app.post("/filterCollectionData/attrValues")
async def getFilterCollectionAttrValues(payload: AttributeValues):
    """
    Fetches all values of a certain attribute in a collection
    """
    target_conn = getConnection(payload.collection)
    target_collection = target_conn["collection"]
    attribute_values = []
    try:
        unique_values = target_collection.distinct(payload.attribute)
        unique_values = [x for x in unique_values if not (isinstance(x, float) and math.isnan(x))]
        attribute_values = sorted(unique_values)
        if attribute_values:
            return {"status": "success", "data": attribute_values}
        else:
            return {"status": "error", "message": "There is no attribute with that name found in the data"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


class GeneratedGraphs(BaseModel):
    graphType: str
    data: List[Dict]
    properties: List[Dict]
    attributes: List[str]

@app.put("/generatedGraphs")
async def addGeneratedGraphs(payload: GeneratedGraphs):
    """
    Saves the graph data and the respective graph type the user previously selected to generate the graph using the data  
    """
    connection = getConnection("graphs")
    collection, client = connection["collection"], connection["client"]

    latest = collection.find().sort({"_id":-1}).limit(1)
    data_list = list(latest)
    data_list = [cleanData(item) for item in data_list]
    nextId = 1 if not data_list else data_list[0]["_id"] + 1
    
    graph = {
        "_id": nextId,  
        "graphtype": payload.graphType,
        "data": payload.data,
        "properties": payload.properties,
        "attributes": payload.attributes
    }

    try:
        collection.insert_one(graph)
        return {"status": "success", "message": f"Added generated graph {graph} to storage."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generated graph: {str(e)}")
    finally:
        client.close()


class GeneratedGraphRequest(BaseModel):
    latest: Optional[int]

@app.post("/generatedGraphs/latest")
async def getLastestGraph(payload: GeneratedGraphRequest):
    """
    Fetches the latest number of generated graphs 
    """
    connection = getConnection("graphs")
    collection, client = connection["collection"], connection["client"]

    try:
        limit = payload.latest if payload.latest and payload.latest > 0 else 0
        latestGraphs = list(collection.find().sort("_id", -1).limit(limit))
        return latestGraphs
    except Exception as e: 
        raise HTTPException(status_code=500, detail=f"Error in retreaving latest {payload.latest} graphs: {str(e)}")
    finally:
        client.close()


class RemoveGraphRequest(BaseModel):
    graphId: int

@app.delete("/generatedGraphs/remove-graph")
async def removeGraph(payload: RemoveGraphRequest):
    """
    Removes a graph from the list of latest graphs
    """

    connection = getConnection("graphs")
    collection, client = connection["collection"], connection["client"]

    try:
        result = collection.delete_one(
            {"_id": payload.graphId}
        )
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Graph not found.")
        return {
            "status": "success",
            "message": f"Successfully removed graph {payload.graphId}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing graph: {str(e)}")
    finally:
        client.close()


class DataRequest(BaseModel):
    experimentId: str

@app.post("/data")
async def getExperimentData(payload: DataRequest):
    """
    Fetches data related to a specific experimentId from the 'data' collection.
    """
    connection = getConnection("data")
    collection, client = connection["collection"], connection["client"]

    try:
        data = collection.find({"experimentId": payload.experimentId})
        dataList = list(data)
        dataList = [cleanData(item) for item in dataList]
        if dataList:
            return {"status": "success", "data": dataList}
        else:
            raise HTTPException(
                status_code=404, detail="No data found for the given experimentId."
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

    finally:
        client.close()


@app.get("/experimentIds")
async def getExperimentIds():
    """
    Fetches all experimentIds from the 'experiments' collection.
    """
    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        experiment_ids = collection.find({}, {"experimentId": 1}).sort("#", 1)
        experiment_id_list = [
            doc["experimentId"] for doc in experiment_ids if "experimentId" in doc
        ]
        return {"status": "success", "experimentIds": experiment_id_list}
    except Exception as e:
        return {"error": str(e)}
    finally:
        client.close()


@app.get("/experiments")
async def getExperiments():
    """
    Fetches all data from the 'experiments' collection.
    """
    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        experiments = collection.find()
        experimentsList = list(experiments)
        experimentsList = [cleanData(item) for item in experimentsList]
        if experimentsList:
            return {"status": "success", "data": experimentsList}
        else:
            raise HTTPException(status_code=404, detail="No experiments found.")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching experiments: {str(e)}"
        )

    finally:
        client.close()


class UpdateDataPayload(BaseModel):
    updatedData: Dict[str, Dict[str, object]]

@app.put("/update-data")
async def update_data(payload: UpdateDataPayload):
    """
    Updates multiple rows in the 'data' collection based on experiment IDs.
    Each experiment ID maps to a dictionary of fields to update.
    """
    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        total_modified_count = 0

        for experiment_id, update_fields in payload.updatedData.items():
            processed_fields = {}
            for key, value in update_fields.items():
                if isinstance(value, str):
                    try:
                        num_value = float(value)
                        processed_fields[key] = (
                            int(num_value) if num_value.is_integer() else num_value
                        )
                    except ValueError:
                        processed_fields[key] = value
                else:
                    processed_fields[key] = value

            result = collection.update_one(
                {"experimentId": experiment_id}, {"$set": processed_fields}
            )

            if result.matched_count == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"No experiment found with ID: {experiment_id}",
                )

            total_modified_count += result.modified_count

        return {
            "status": "success",
            "message": f"Updated {total_modified_count} rows successfully.",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating data: {str(e)}")

    finally:
        client.close()


class AddColumnRequest(BaseModel):
    columnName: str
    defaultValue: str | int | None = None


@app.put("/experiments/add-column")
async def add_column(payload: AddColumnRequest):
    """
    Adds a new column to all documents in the 'experiments' collection.
    """
    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        result = collection.update_many(
            {}, {"$set": {payload.columnName: payload.defaultValue}}
        )
        return {
            "status": "success",
            "message": f"Added column {payload.columnName} to {result.modified_count} rows.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding column: {str(e)}")
    finally:
        client.close()


class AddRowRequest(BaseModel):
    rowData: dict


@app.post("/experiments/add-row")
async def add_row(payload: AddRowRequest):
    """
    Adds a new row (document) to the 'experiments' collection.
    """

    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        collection.insert_one(payload.rowData)
        return {"status": "success", "message": "Row added successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding row: {str(e)}")
    finally:
        client.close()


class RemoveColumnRequest(BaseModel):
    columnName: str


@app.put("/experiments/remove-column")
async def remove_column(payload: RemoveColumnRequest):
    """
    Removes a column from all documents in the 'experiments' collection.
    """

    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        result = collection.update_many({}, {"$unset": {payload.columnName: ""}})
        return {
            "status": "success",
            "message": f"Removed column {payload.columnName} from {result.modified_count} rows.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing column: {str(e)}")
    finally:
        client.close()


class RemoveRowRequest(BaseModel):
    experimentIds: List[str]


@app.delete("/experiments/remove-rows")
async def remove_rows(payload: RemoveRowRequest):
    """
    Removes one or more rows (documents) from the 'experiments' collection by experimentIds.
    """

    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        result = collection.delete_many(
            {"experimentId": {"$in": payload.experimentIds}}
        )
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Experiments not found.")
        return {
            "status": "success",
            "message": f"{result.deleted_count} rows removed successfully.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing rows: {str(e)}")
    finally:
        client.close()


@app.get("/columntypes")
async def getColumnTypes():
    """
    Fetches the types for each column from the 'config' collection.
    """
    connection = getConnection("config")
    collection, client = connection["collection"], connection["client"]

    try:
        types = collection.find()
        typesList = list(types)
        typesList = [cleanData(item) for item in typesList]
        if typesList:
            return {"status": "success", "data": typesList}
        else:
            raise HTTPException(status_code=404, detail="No column types found.")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching column types: {str(e)}"
        )

    finally:
        client.close()


class SetColumnTypes(BaseModel):
    newColumnTypes: Dict[str, str]

@app.put("/update-column-types")
async def updateColumnTypes(payload: SetColumnTypes):
    """
    Updates new column types in the "config" collection.
    """
    connection = getConnection("config")
    collection, client = connection["collection"], connection["client"]

    if not payload.newColumnTypes:
        raise HTTPException(status_code=500, detail="No payload found.")
    
    try:
        current = collection.find_one({})
        updateOperations = {}
        updateFields = {
            col: newType
            for col, newType in payload.newColumnTypes.items() if col not in current or current[col] != newType
        }
        removeFields = {
            col: ""
            for col in current if col not in payload.newColumnTypes and col != "_id"
        }
        if updateFields:
            updateOperations["$set"] = updateFields
        if removeFields:
            updateOperations["$unset"] = removeFields
        
        result = collection.update_one({}, updateOperations)
        return {"status": "success", "message": f"{result.modified_count} column types updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating column types: {str(e)}")
    finally:
        client.close()


@app.get("/efficiencies")
async def getEfficiencies():
    """
    Fetches all data from the 'efficiencies' collection.
    """
    connection = getConnection("efficiencies")
    collection, client = connection["collection"], connection["client"]

    fieldOrder = [
        "_id",
        "experimentId",
        "Time Interval",
        "Current Efficiency (HCl)",
        "Current Efficiency (NaOH)",
        "Voltage Drop Efficiency",
        "Reaction Efficiency",
        "Overall Efficiency"
    ]

    try:
        efficiencies = collection.find()
        efficenciesList = list(efficiencies)
        
        # clean and reorder fields for each record in collection
        reordered = [
            {field: cleanData(item).get(field) for field in fieldOrder}
            for item in efficenciesList
        ]
        if reordered:
            return {"status": "success", "data": reordered}
        else:
            raise HTTPException(status_code=404, detail="No efficiency calculations found.")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching efficiency calculatiosn: {str(e)}"
        )

    finally:
        client.close()


async def getExperimentData(experimentId: str, interval: int):
    """
    Helper function to fetch experiment data within given time interval.
    """
    dataConnection = getConnection("data")
    dataCollection, dataClient = dataConnection["collection"], dataConnection["client"]

    query = {"experimentId": experimentId}
    projection = {"Time": 1, "U Cmm": 1, "U Stac": 1, "I Cmm": 1, "C1 Cond": 1, "C2 Cond": 1}
    try:
        if interval > 0:
            # get timestamp of first data point to set end time
            experiment = dataCollection.find_one({ "experimentId": experimentId}, {"_id": 0, "Time": 1})
            if not experiment:
                raise HTTPException(status_code=404, detail=f"getExperimentData: No experiment found for experimentId: {experimentId}")
            startTime = datetime.strptime(experiment["Time"], "%Y/%m/%d %H:%M:%S")
            endTime = startTime + timedelta(minutes=interval)
            query["Time"] = {"$lte": endTime.strftime("%Y/%m/%d %H:%M:%S")}
        elif interval < 0:
            # get timestamp of last data point to set start time
            experiment = dataCollection.find({"experimentId": experimentId}).sort("Time", -1).limit(1)
            experiment = list(experiment)
            if not experiment:
                raise HTTPException(status_code=404, detail=f"getExperimentData: No experiment found for experimentId: {experimentId}")
            endTime = datetime.strptime(experiment[0]["Time"], "%Y/%m/%d %H:%M:%S")
            startTime = endTime - timedelta(minutes=abs(interval))
            query["Time"] = {"$gte": startTime.strftime("%Y/%m/%d %H:%M:%S")}

        data = dataCollection.find(query, projection).sort({"Time": 1})
        if not data:
            raise HTTPException(status_code=404, detail="No data found for the given experimentId.")
        datalist = list(data)[:-1]      # final recorded data point ignored in calculations
        datalist = [cleanData(item) for item in datalist]
        return datalist
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data1: {str(e)}")
    finally:
        dataClient.close()


async def compute(efficiency, experiment, results, payload):
    """
    Helper function to call corresponding efficiency computation functions.
    """
    if efficiency in ["Current Efficiency (HCl)", "Current Efficiency (NaOH)"]:
        VOLUME_FIELD = "Final volume (L) "
        compound = "HCL" if efficiency == "Current Efficiency (HCl)" else "NaOH"
        finalVol, numStacks = experiment.get(VOLUME_FIELD + compound), experiment.get("# of Stacks")
        if finalVol is None or numStacks is None:
            raise Exception(f"Missing data for final volumes or number of stacks (triplets).")
        return computeCurrentEfficiency(results, compound, finalVol, numStacks)

    if efficiency == "Voltage Drop Efficiency":
        return computeVoltageDropEfficiency(results)

    if efficiency == "Reaction Efficiency":
        VOLUME_FIELD = "Final volume (L) "
        volHCl, volNaOH = experiment.get(VOLUME_FIELD + "HCL"), experiment.get(VOLUME_FIELD + "NaOH")
        if volHCl is None or volNaOH is None:
            raise Exception("Missing data for final volumes.")
        reactionResults = await getExperimentData(payload.experimentId, -5)
        return computeReactionEfficiency(reactionResults, volHCl, volNaOH)

    return None


class EfficiencyRequest(BaseModel):
    experimentId: str
    selectedEfficiencies: List[str]
    timeInterval: int

@app.post("/calculate-efficiencies")
async def calculateEfficiency(payload: EfficiencyRequest):
    efficienciesConnection = getConnection("efficiencies")
    efficienciesCollection, efficienciesClient = efficienciesConnection["collection"], efficienciesConnection["client"]
    
    # check if calculations were already done before
    try:
        existingEntry = efficienciesCollection.find_one({
            "_id": payload.experimentId + " " + str(payload.timeInterval)
        })
        if existingEntry:
            # check which efficiencies have already been computed
            computedEfficiencies = {key: value for key, value in existingEntry.items() if key not in ["_id", "experimentId", "Time Interval"]}
            efficienciesToCompute = [eff for eff in payload.selectedEfficiencies if eff not in computedEfficiencies]
            if not efficienciesToCompute:
                return {"message": "Efficiency factors in this request have already been computed", "status": "repeated"}
        else:
            computedEfficiencies = {}
            efficienciesToCompute = payload.selectedEfficiencies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

    # fetch experiment metadata
    expConnection = getConnection("experiments")
    expCollection, expClient = expConnection["collection"], expConnection["client"]
    experiment = expCollection.find_one({"experimentId": payload.experimentId})
    if not experiment:
        raise HTTPException(status_code=404, detail=f"Experiment metadata not found for {payload.experimentId}.")
    
    # fetch detailed experiment data
    results = await getExperimentData(payload.experimentId, payload.timeInterval)

    for efficiency in efficienciesToCompute:
        try:
            computedEfficiencies[efficiency] = await compute(efficiency, experiment, results, payload)
        except Exception as e:
            computedEfficiencies[efficiency] = 0
            raise Exception(f"Error computing {efficiency}: {str(e)}")

    # handle overall efficiency calculation if requested
    if "Overall Efficiency" in payload.selectedEfficiencies:
        values = [v for v in computedEfficiencies.values() if v is not None and v != 0]
        if values:
            computedEfficiencies["Overall Efficiency"] = computeOverallEfficiency(values)
        else:
            computedEfficiencies["Overall Efficiency"] = 0

    # store computed efficiencies in collections
    try:
        efficienciesCollection.update_one(
            {"_id": payload.experimentId + " " + str(payload.timeInterval),
             "experimentId": payload.experimentId, 
             "Time Interval": payload.timeInterval
            },
            {"$set": computedEfficiencies},
            upsert=True
        )
        if payload.timeInterval == 0:
            expCollection.update_one(
                {"experimentId": payload.experimentId},
                {"$set": computedEfficiencies}
            )
        return {"message": "Efficiency factors computed successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding calculations: {str(e)}")
    finally:
        expClient.close()
        efficienciesClient.close()


@app.get("/")
async def root():
    """
    Basic root endpoint to confirm server is running.
    """
    return {"message": "FastAPI server is working!"}
