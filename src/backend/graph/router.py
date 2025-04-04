import math

import numpy as np
from fastapi import APIRouter, HTTPException

from database import getConnection
from utils import cleanData
from graph.models import (  
    DataAttrs,
    DataFilter,
    ExperimentFilter,
    AttributeValues,
    GeneratedGraphs,
    GeneratedGraphRequest,
    RemoveGraphRequest
)

router = APIRouter()


# Heper functions
async def fetchData(collection, query, projection, client):
    """Fetch and process data from the database."""
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
    """
    Performs simple linear regression analysis on the provided data.
    Returns the slope, intercept, and R-squared coefficient.
    """
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


# Routes
@router.post("/getAttrs")
async def getCollectionAttrs(payload: DataAttrs):
    """
    Fetches the attributes of the data in a specified collection.
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


@router.post("/filterCollectionData")
async def getFilterCollectionData(payload: DataFilter):
    """
    Fetches the data needed to generate graphs.
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
            response = await fetchData(target_collection, query, attrs, target_client)

        # Handle all other cases
        else:
            target_conn = getConnection(payload.collection)
            target_collection, target_client = target_conn["collection"], target_conn["client"]

            if len(payload.dates) > 0:
                query = {"Date": {"$in": payload.dates}}
            else:
                query = {}
            response = await fetchData(target_collection, query, attrs, target_client)
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
        target_client.close()


@router.post("/getFilterCollectionDates")
async def getFilterCollectionDates(payload: ExperimentFilter):
    """
    Fetches the dates from filtered value.
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
        target_client.close()


@router.post("/filterCollectionData/attrValues")
async def getFilterCollectionAttrValues(payload: AttributeValues):
    """
    Fetches all values of a certain attribute in a collection.
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


@router.put("/generatedGraphs")
async def addGeneratedGraphs(payload: GeneratedGraphs):
    """
    Caches the graph data in the database.  
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


@router.post("/generatedGraphs/latest")
async def getLastestGraph(payload: GeneratedGraphRequest):
    """
    Fetches the latest number of generated graphs.
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


@router.delete("/generatedGraphs/remove-graph")
async def removeGraph(payload: RemoveGraphRequest):
    """
    Removes a graph from the graphs collection.
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
