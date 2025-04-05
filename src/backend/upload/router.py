# -----------------------------------------------------------------------------
# Primary author: Jason T
# Year: 2025
# Purpose: Upload-related API routes for handling file uploads and processing.
# -----------------------------------------------------------------------------

import os
import base64

import pandas as pd
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

from services.migrationService import MigrationService
from upload.models import (
    FilesPayload,
    FilePayload,
    LinkedDataPayload,
    ManualUploadPayload
)

load_dotenv()
router = APIRouter()


# Helper functions
def sanitizeFilename(filename: str) -> str:
    """Sanitize filenames by removing unwanted characters."""
    return "".join(c for c in filename if c.isalnum() or c in (" ", ".", "_")).strip()


def decodeAndSave(filePayload: FilePayload) -> str:
    """Decode the base64 content of the file and saves it to a temporary location."""
    try:
        fileContent = base64.b64decode(filePayload.content)
    except Exception as decode_error:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base64 content for file: {filePayload.filename}",) from decode_error

    sanitizedFilename = sanitizeFilename(filePayload.filename)
    tempFilePath = os.path.join(os.getcwd(), sanitizedFilename)

    with open(tempFilePath, "wb") as tempFile:
        tempFile.write(fileContent)

    return tempFilePath


def decodeAndSaveLinked(filePayload: LinkedDataPayload) -> dict:
    """Decode the base64 content of the data file and saves it to a temporary
    location with its linked ID."""
    try:
        fileContent = base64.b64decode(filePayload.content)
    except Exception as decode_error:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid base64 content for file: {filePayload.filename}",
        ) from decode_error

    sanitizedFilename = sanitizeFilename(filePayload.filename)
    tempFilePath = os.path.join(os.getcwd(), sanitizedFilename)

    with open(tempFilePath, "wb") as tempFile:
        tempFile.write(fileContent)

    return {"path": tempFilePath, "linkedId": filePayload.linkedId}


@router.post("/upload")
async def upload(payload: FilesPayload):
    """
    Processes uploaded files for experiment and data categories.
    Decodes base64 content, saves them temporarily, uses MigrationService
    to handle the files, and cleans up resources.
    """
    tempExperimentFiles = []
    tempDataFiles = []

    try:
        for file in payload.experimentFiles:
            tempExperimentFiles.append(decodeAndSave(file))

        for file in payload.dataFiles:
            tempDataFiles.append(decodeAndSave(file))

        if not tempExperimentFiles and not tempDataFiles:
            raise HTTPException(
                status_code=400, detail="No valid files provided."
            )

        MONGO_URI = os.getenv("CONNECTION_STRING")
        DB_NAME = "alkalyticsDB"
        migrationService = MigrationService(MONGO_URI, DB_NAME)

        try:
            ambiguousData = await migrationService.migrate(
                experimentFilePaths=tempExperimentFiles,
                dataFilePaths=tempDataFiles,
            )
        finally:
            await migrationService.closeConnection()

        fileMap = {file.filename: file for file in payload.dataFiles}

        for data in ambiguousData:
            if data["dataId"] in fileMap:
                data["dataFile"] = fileMap[data["dataId"]]

        # Clean up temporary files
        for tempFile in tempExperimentFiles:
            os.remove(tempFile)
        for tempFile in tempDataFiles:
            os.remove(tempFile)

        return {
            "status": "success",
            "message": "Files processed successfully.",
            "ambiguousData": ambiguousData,
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


@router.post("/manual-upload")
async def manualUpload(payload: ManualUploadPayload):
    """
    Processes uploaded files for experiment and data categories.
    Decodes base64 content, saves them temporarily, uses
    MigrationService to handle the files, and cleans up resources.
    """
    tempLinkedDataFiles = []

    try:
        for file in payload.linkedData:
            tempLinkedDataFiles.append(decodeAndSaveLinked(file))

        MONGO_URI = os.getenv("CONNECTION_STRING")
        DB_NAME = "alkalyticsDB"
        migrationService = MigrationService(MONGO_URI, DB_NAME)

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
