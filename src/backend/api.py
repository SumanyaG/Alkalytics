import math
import os
import base64
from typing import Dict, List, Optional
from bson import ObjectId
from dotenv import load_dotenv
import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

from services.migrationService import MigrationService
from auth.routes import router as authRouter

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


class FilePayload(BaseModel):
    filename: str
    mimetype: str
    content: str


class FilesPayload(BaseModel):
    experimentFiles: list[FilePayload]
    dataFiles: list[FilePayload]


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

@app.post("/upload")
async def upload(payload: FilesPayload):
    """
    Processes uploaded files for experiment and data categories.
    Decodes base64 content, saves them temporarily, uses MigrationService
    to handle the files, and cleans up resources.
    """
    tempExperimentFiles = []
    tempDataFiles = []

#     try:

#         def decodeAndSave(filePayload: FilePayload) -> str:
#             try:
#                 file_content = base64.b64decode(filePayload.content)
#             except Exception as decode_error:
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Invalid base64 content for file: {
#                         filePayload.filename}",
#                 ) from decode_error

#             sanitized_filename = sanitizeFilename(filePayload.filename)
#             tempFilePath = os.path.join(os.getcwd(), sanitized_filename)

#             with open(tempFilePath, "wb") as temp_file:
#                 temp_file.write(file_content)

#             return tempFilePath

#         for file in payload.experimentFiles:
#             tempExperimentFiles.append(decodeAndSave(file))

#         for file in payload.dataFiles:
#             tempDataFiles.append(decodeAndSave(file))

#         if not tempExperimentFiles and not tempDataFiles:
#             raise HTTPException(
#                 status_code=400, detail="No valid files provided."
#             )

#         mongoUri = os.getenv("CONNECTION_STRING")
#         dbName = "alkalyticsDB"
#         migrationService = MigrationService(mongoUri, dbName)

#         try:
#             ambiguous_data = await migrationService.migrate(
#                 experimentFilePaths=tempExperimentFiles,
#                 dataFilePaths=tempDataFiles,
#             )
#         finally:
#             await migrationService.closeConnection()

#         file_map = {file.filename: file for file in payload.dataFiles}

#         for data in ambiguous_data:
#             if data["dataId"] in file_map:
#                 data["dataFile"] = file_map[data["dataId"]]

#         # Clean up temporary files
#         for tempFile in tempExperimentFiles:
#             os.remove(tempFile)
#         for tempFile in tempDataFiles:
#             os.remove(tempFile)

#         return {
#             "status": "success",
#             "message": "Files processed successfully.",
#             "ambiguousData": ambiguous_data,
#         }

#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         # Clean up temporary experiment files
#         for tempFile in tempExperimentFiles:
#             if os.path.exists(tempFile):
#                 os.remove(tempFile)

#         # Clean up temporary data files
#         for tempFile in tempDataFiles:
#             if os.path.exists(tempFile):
#                 os.remove(tempFile)

#         raise HTTPException(
#             status_code=500, detail=f"Error processing files: {str(e)}"
#         )


# class LinkedDataPayload(BaseModel):
#     filename: str
#     mimetype: str
#     content: str
#     linkedId: str


# class ManualUploadPayload(BaseModel):
#     linkedData: list[LinkedDataPayload]


# @app.post("/manual-upload")
# async def manualUpload(payload: ManualUploadPayload):
#     """
#     Processes uploaded files for experiment and data categories.
#     Decodes base64 content, saves them temporarily, uses
#     MigrationService to handle the files, and cleans up resources.
#     """
#     tempLinkedDataFiles = []

#     try:
#         def decodeAndSave(filePayload: LinkedDataPayload) -> dict:
#             try:
#                 file_content = base64.b64decode(filePayload.content)
#             except Exception as decode_error:
#                 raise HTTPException(
#                     status_code=400,
#                     detail=f"Invalid base64 content for file: {
#                         filePayload.filename}",
#                 ) from decode_error

#             sanitized_filename = sanitizeFilename(filePayload.filename)
#             tempFilePath = os.path.join(os.getcwd(), sanitized_filename)

#             with open(tempFilePath, "wb") as temp_file:
#                 temp_file.write(file_content)

#             return {"path": tempFilePath, "linkedId": filePayload.linkedId}

#         for file in payload.linkedData:
#             tempLinkedDataFiles.append(decodeAndSave(file))

#         mongoUri = os.getenv("CONNECTION_STRING")
#         dbName = "alkalyticsDB"
#         migrationService = MigrationService(mongoUri, dbName)

#         try:
#             for tempData in tempLinkedDataFiles:
#                 dataDf = pd.read_excel(tempData["path"], sheet_name=0)
#                 dataDf = migrationService.cleanData(dataDf)

#                 records = await migrationService.linkData(
#                     dataDf, tempData["linkedId"]
#                 )

#                 if records:
#                     await migrationService.dataSheetsCollection.insert_many(
#                         records
#                     )
#         finally:
#             await migrationService.closeConnection()

#         for tempFile in tempLinkedDataFiles:
#             if os.path.exists(tempFile["path"]):
#                 os.remove(tempFile["path"])

#         return {
#             "status": "success",
#             "message": "Files processed successfully.",
#         }

#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         for tempFile in tempLinkedDataFiles:
#             if os.path.exists(tempFile):
#                 os.remove(tempFile)

#         raise HTTPException(
#             status_code=500, detail=f"Error processing files: {str(e)}"
#         )

class DataAttrs(BaseModel):
    collection: str

@app.post("/getAttrs")
async def getCollectionAttrs(payload:DataAttrs):
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

class ExperimentFilter(BaseModel):
    collection: str
    attributes: List[str]
    dates:Optional[List[str]] = None

@app.post("/filterCollectionData")
async def getFilterCollectionData(payload: ExperimentFilter):
    """
    Fetches the data needed to generate graphs
    """
    # Prepare attributes for projection
    attrs = {field: 1 for field in payload.attributes}
    attrs["Date"] = 1

    # Helper function to fetch and process data
    async def fetch_and_process_data(collection, query, projection, client):
        try:
            filtered_data = collection.find(query, projection)
            data_list = list(filtered_data)
            data_list = [cleanData(item) for item in data_list]

            if not data_list:
                raise HTTPException(status_code=404, detail="Data has no attributes of that name.")
            
            return {"status": "success", "data": data_list}
        
        except Exception as e:
            return {"status": "error", "message": str(e)}
        
        finally:
            client.close()

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
        return await fetch_and_process_data(target_collection, query, attrs, target_client)

    # Handle all other cases
    target_conn = getConnection(payload.collection)
    target_collection, target_client = target_conn["collection"], target_conn["client"]

    if len(payload.dates) > 0:
        query = {"Date": {"$in": payload.dates}}
    else:
        query = {} 
    return await fetch_and_process_data(target_collection, query, attrs, target_client)

class GeneratedGraphs(BaseModel):
    graphType: str
    data: List[Dict]

@app.put("/generatedGraphs")
async def addGeneratedGraphs(payload: GeneratedGraphs):
    """
    Saves the graph data and the respective graph type the user previously selected to generate the graph using the data  
    """
    connection = getConnection("graphs")
    collection, client = connection["collection"], connection["client"]

    nextId = collection.count_documents({}) + 1
    graph = {
        "_id": nextId,  
        "graphtype": payload.graphType,
        "data": payload.data
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
        latestGraphs = []
        totalData = collection.count_documents({})
        count = 0
        if payload.latest == 0: payload.latest = totalData

        while count < payload.latest:
            data = collection.find_one({"_id": totalData-count})
            latestGraphs.append(data)
            count = count + 1
        return latestGraphs
    except Exception as e: 
        raise HTTPException(status_code=500, detail=f"Error in retreaving latest {payload.latest} graphs: {str(e)}")
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
        experiment_ids = collection.find({}, {"experimentId": 1})
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


@app.get("/")
async def root():
    """
    Basic root endpoint to confirm server is running.
    """
    return {"message": "FastAPI server is working!"}
