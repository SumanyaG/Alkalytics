import os
import base64
from dotenv import load_dotenv
import pandas as pd
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.migrationService import MigrationService

load_dotenv()
app = FastAPI(docs_url="/docs")

# Middleware for CORS
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
        # Helper function to sanitize filename
        def sanitize_filename(filename: str) -> str:
            return "".join(
                c for c in filename if c.isalnum() or c in (" ", ".", "_")
            ).strip()

        # Helper function to decode and save a file temporarily
        def decodeAndSave(filePayload: FilePayload) -> str:
            try:
                file_content = base64.b64decode(filePayload.content)
            except Exception as decode_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid base64 content for file: {
                        filePayload.filename}",
                ) from decode_error

            # Sanitize the filename and create a temporary path
            sanitized_filename = sanitize_filename(filePayload.filename)
            tempFilePath = os.path.join(os.getcwd(), sanitized_filename)

            # Save the file content to the temporary path
            with open(tempFilePath, "wb") as temp_file:
                temp_file.write(file_content)

            return tempFilePath

        # Decode and save experiment files
        for file in payload.experimentFiles:
            tempExperimentFiles.append(decodeAndSave(file))

        # Decode and save data files
        for file in payload.dataFiles:
            tempDataFiles.append(decodeAndSave(file))

        if not tempExperimentFiles and not tempDataFiles:
            raise HTTPException(
                status_code=400, detail="No valid files provided."
            )

        # Process the files with MigrationService
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

        # Create a mapping of filenames to files for quick lookup
        file_map = {file.filename: file for file in payload.dataFiles}

        # Iterate over ambiguous_data and match using the map
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

        def sanitize_filename(filename: str) -> str:
            return "".join(
                c for c in filename if c.isalnum() or c in (" ", ".", "_")
            ).strip()

        def decodeAndSave(filePayload: LinkedDataPayload) -> dict:
            try:
                file_content = base64.b64decode(filePayload.content)
            except Exception as decode_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid base64 content for file: {
                        filePayload.filename}",
                ) from decode_error

            sanitized_filename = sanitize_filename(filePayload.filename)
            tempFilePath = os.path.join(os.getcwd(), sanitized_filename)

            with open(tempFilePath, "wb") as temp_file:
                temp_file.write(file_content)

            return {"path": tempFilePath, "linkedId": filePayload.linkedId}

        for file in payload.linkedData:
            tempLinkedDataFiles.append(decodeAndSave(file))

        # Process the files with MigrationService
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


@app.get("/")
async def root():
    """
    Basic root endpoint to confirm server is running.
    """
    return {"message": "FastAPI server is working!"}


# Run this for testing the app directly
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
