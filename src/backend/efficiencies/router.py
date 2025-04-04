from datetime import datetime, timedelta

from fastapi import HTTPException, APIRouter

from database import getConnection
from utils import cleanData
from efficiencies.models import EfficiencyRequest
from efficiencies.efficiencyCalculations import (
    computeCurrentEfficiency,
    computeVoltageDropEfficiency,
    computeReactionEfficiency,
    computeOverallEfficiency,
)

router = APIRouter()


# Helper functions
async def getExperimentData(experimentId: str, interval: int):
    """Helper function to fetch experiment data within given time interval."""
    dataConnection = getConnection("data")
    dataCollection, dataClient = dataConnection["collection"], dataConnection["client"]

    query = {"experimentId": experimentId}
    PROJECTION = {"Time": 1, "U Cmm": 1, "U Stac": 1, "I Cmm": 1, "C1 Cond": 1, "C2 Cond": 1}
    try:
        if interval > 0:
            # Get timestamp of first data point to set end time
            experiment = dataCollection.find_one({ "experimentId": experimentId}, {"_id": 0, "Time": 1})
            if not experiment:
                raise HTTPException(status_code=404, detail=f"getExperimentData: No experiment found for experimentId: {experimentId}")

            startTime = datetime.strptime(experiment["Time"], "%Y/%m/%d %H:%M:%S")
            endTime = startTime + timedelta(minutes=interval)
            query["Time"] = {"$lte": endTime.strftime("%Y/%m/%d %H:%M:%S")}

        elif interval < 0:
            # Get timestamp of last data point to set start time
            experiment = dataCollection.find({"experimentId": experimentId}).sort("Time", -1).limit(1)
            experiment = list(experiment)
            if not experiment:
                raise HTTPException(status_code=404, detail=f"getExperimentData: No experiment found for experimentId: {experimentId}")

            endTime = datetime.strptime(experiment[0]["Time"], "%Y/%m/%d %H:%M:%S")
            startTime = endTime - timedelta(minutes=abs(interval))
            query["Time"] = {"$gte": startTime.strftime("%Y/%m/%d %H:%M:%S")}

        data = dataCollection.find(query, PROJECTION).sort({"Time": 1})
        if not data:
            raise HTTPException(status_code=404, detail="No data found for the given experimentId.")

        datalist = list(data)[:-1]      # Final recorded data point ignored in calculations
        datalist = [cleanData(item) for item in datalist]
        return datalist
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data1: {str(e)}")
    finally:
        dataClient.close()


async def compute(efficiency, experiment, results, payload):
    """Helper function to call corresponding efficiency computation functions."""
    if efficiency in ["Current Efficiency (HCl)", "Current Efficiency (NaOH)"]:
        VOLUME_FIELD = "Final volume (L) "
        COMPOUND = "HCL" if efficiency == "Current Efficiency (HCl)" else "NaOH"
        finalVol, numStacks = experiment.get(VOLUME_FIELD + COMPOUND), experiment.get("# of Stacks")

        if finalVol is None or numStacks is None:
            raise Exception(f"Missing data for final volumes or number of stacks (triplets).")
        return computeCurrentEfficiency(results, COMPOUND, finalVol, numStacks)

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


# Routes
@router.get("/efficiencies")
async def getEfficiencies():
    """Fetches all data from the 'efficiencies' collection."""
    connection = getConnection("efficiencies")
    collection, client = connection["collection"], connection["client"]

    FIELD_ORDER = [
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
        
        # Clean and reorder fields for each record in collection
        reordered = [
            {field: cleanData(item).get(field) for field in FIELD_ORDER}
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


@router.post("/calculate-efficiencies")
async def calculateEfficiency(payload: EfficiencyRequest):
    efficienciesConnection = getConnection("efficiencies")
    efficienciesCollection, efficienciesClient = efficienciesConnection["collection"], efficienciesConnection["client"]
    
    # Check if calculations were already done before
    try:
        existingEntry = efficienciesCollection.find_one({
            "_id": payload.experimentId + " " + str(payload.timeInterval)
        })
        if existingEntry:
            computedEfficiencies = {key: value for key, value in existingEntry.items() if key not in ["_id", "experimentId", "Time Interval"]}
            efficienciesToCompute = [eff for eff in payload.selectedEfficiencies if eff not in computedEfficiencies]
            if not efficienciesToCompute:
                return {"message": "Efficiency factors in this request have already been computed", "status": "repeated"}
        else:
            computedEfficiencies = {}
            efficienciesToCompute = payload.selectedEfficiencies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

    # Fetch experiment metadata
    expConnection = getConnection("experiments")
    expCollection, expClient = expConnection["collection"], expConnection["client"]
    experiment = expCollection.find_one({"experimentId": payload.experimentId})
    if not experiment:
        raise HTTPException(status_code=404, detail=f"Experiment metadata not found for {payload.experimentId}.")
    
    # Fetch detailed experiment data
    results = await getExperimentData(payload.experimentId, payload.timeInterval)

    for efficiency in efficienciesToCompute:
        try:
            computedEfficiencies[efficiency] = await compute(efficiency, experiment, results, payload)
        except Exception as e:
            computedEfficiencies[efficiency] = 0
            raise Exception(f"Error computing {efficiency}: {str(e)}")

    # Handle overall efficiency calculation if requested
    if "Overall Efficiency" in payload.selectedEfficiencies:
        values = [v for v in computedEfficiencies.values() if v is not None and v != 0]
        if values:
            computedEfficiencies["Overall Efficiency"] = computeOverallEfficiency(values)
        else:
            computedEfficiencies["Overall Efficiency"] = 0

    # Store computed efficiencies in collections
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
