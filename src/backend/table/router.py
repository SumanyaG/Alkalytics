# -----------------------------------------------------------------------------
# Primary author: Jason T
# Contributors: Kate M
# Year: 2025
# Purpose: Table-related API endpoints for handling data and experiment retrieval.
# -----------------------------------------------------------------------------

from fastapi import APIRouter, HTTPException

from database import getConnection
from utils import cleanData
from table.models import (
    AddColumnRequest,
    AddRowRequest,
    DataRequest,
    RemoveColumnRequest,
    RemoveRowRequest,
    SetColumnTypes,
    UpdateDataPayload
)

router = APIRouter()


@router.post("/data")
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


@router.get("/experimentIds")
async def getExperimentIds():
    """
    Fetches all experimentIds from the 'experiments' collection.
    """
    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        experimentIds = collection.find({}, {"experimentId": 1}).sort("#", 1)
        experimentIdList = [
            doc["experimentId"] for doc in experimentIds if "experimentId" in doc
        ]
        return {"status": "success", "experimentIds": experimentIdList}
    except Exception as e:
        return {"error": str(e)}
    finally:
        client.close()


@router.get("/experiments")
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


@router.put("/update-data")
async def updateData(payload: UpdateDataPayload):
    """
    Updates multiple rows in the 'data' collection based on experiment IDs.
    Each experiment ID maps to a dictionary of fields to update.
    """
    connection = getConnection("experiments")
    collection, client = connection["collection"], connection["client"]

    try:
        totalModifiedCount = 0

        for experimentId, updateFields in payload.updatedData.items():
            processedFields = {}
            for key, value in updateFields.items():
                if isinstance(value, str):
                    try:
                        numValue = float(value)
                        processedFields[key] = (
                            int(numValue) if numValue.is_integer() else numValue
                        )
                    except ValueError:
                        processedFields[key] = value
                else:
                    processedFields[key] = value

            result = collection.update_one(
                {"experimentId": experimentId}, {"$set": processedFields}
            )

            if result.matched_count == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"No experiment found with ID: {experimentId}",
                )

            totalModifiedCount += result.modified_count

        return {
            "status": "success",
            "message": f"Updated {totalModifiedCount} rows successfully.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating data: {str(e)}")
    finally:
        client.close()


@router.put("/experiments/add-column")
async def addColumn(payload: AddColumnRequest):
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


@router.post("/experiments/add-row")
async def addRow(payload: AddRowRequest):
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


@router.put("/experiments/remove-column")
async def removeColumn(payload: RemoveColumnRequest):
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


@router.delete("/experiments/remove-rows")
async def removeRows(payload: RemoveRowRequest):
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


@router.get("/columntypes")
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


@router.put("/update-column-types")
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
