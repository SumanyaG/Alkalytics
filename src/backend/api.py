import math
import os
import base64
from bson import ObjectId
from dotenv import load_dotenv
import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

from services.migrationService import MigrationService

load_dotenv()
app = FastAPI(docs_url="/docs")
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

def sanitizeFilename(filename: str) -> str:
            return "".join(
                c for c in filename if c.isalnum() or c in (" ", ".", "_")
            ).strip()

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
                    detail=f"Invalid base64 content for file: {
                        filePayload.filename}",
                ) from decode_error

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
                    detail=f"Invalid base64 content for file: {
                        filePayload.filename}",
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
    

@app.get("/experimentIds")
async def getExperimentIds():
    """
    Fetches all experimentIds from the 'experiments' collection.
    """
    mongoUri = os.getenv("CONNECTION_STRING")
    dbName = "alkalyticsDB"
    client = MongoClient(mongoUri)
    db = client[dbName]
    collection = db["experiments"]
    
    try:
        experiment_ids = collection.find({}, {"experimentId": 1})
        experiment_id_list = [doc["experimentId"] for doc in experiment_ids if "experimentId" in doc]
        return {"status": "success", "experimentIds": experiment_id_list}
    except Exception as e:
        return {"error": str(e)}
    finally:
        client.close()



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

@app.get("/experiments")
async def getExperiments():
    """
    Fetches all data from the 'experiments' collection.
    """
    mongoUri = os.getenv("CONNECTION_STRING")
    dbName = "alkalyticsDB"
    client = MongoClient(mongoUri)
    db = client[dbName]
    collection = db["experiments"]

    try:
        experiments = collection.find()
        experimentsList = list(experiments)
        experimentsList = [cleanData(item) for item in experimentsList]
        if experimentsList:
            return {"status": "success", "data": experimentsList}
        else:
            raise HTTPException(status_code=404, detail="No experiments found.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching experiments: {str(e)}")
    
    finally:
        client.close()



class DataRequest(BaseModel):
    experimentId: str

@app.post("/data")
async def getExperimentData(request: DataRequest):
    """
    Fetches data related to a specific experimentId from the 'data' collection.
    """
    mongoUri = os.getenv("CONNECTION_STRING")
    dbName = "alkalyticsDB"
    client = MongoClient(mongoUri)
    db = client[dbName]
    collection = db["data"]  

    try:
        data = collection.find({"experimentId": request.experimentId})
        dataList = list(data)
        dataList = [cleanData(item) for item in dataList]
        if dataList:
            return {"status": "success", "data": dataList}
        else:
            raise HTTPException(status_code=404, detail="No data found for the given experimentId.")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
    
    finally:
        client.close()


@app.get("/")
async def root():
    """
    Basic root endpoint to confirm server is running.
    """
    return {"message": "FastAPI server is working!"}
