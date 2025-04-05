# -----------------------------------------------------------------------------
# Primary author: Kate M
# Year: 2025
# Purpose: Functions to calculate various efficiency metrics, including current
# voltage drop, reaction, and overall efficiency. Calculation logic is based
# formulas that were developed by the overseeing research team. 
# -----------------------------------------------------------------------------

import numpy as np

from datetime import datetime

# Field constants
C1_COND = "C1 Cond"
C2_COND = "C2 Cond"
CURRENT = "I Cmm"
VOLTAGE_STACK = "U Stac"
VOLTAGE_TOTAL = "U Cmm"

# Conversion constants
FARADAY_CONSTANT = 96485
MOLAR_MASS = {
    "HCL": 36.4609,
    "NaOH": 39.997
}

# Lookup tables to interpolate conductivity -> concentration
COND_TO_CONC = {
    "conc": [1, 3, 10, 30, 100, 300, 1000, 3000, 10000, 30000, 50000, 100000, 200000],
    "HCL": [11.7, 35, 116, 340, 1140, 3390, 11100, 32200, 103000, 283000, 432000, 709000, 850000], 
    "NaOH": [6.2, 18.4, 61.1, 182, 603, 1780, 5820, 16900, 53200, 144000, 223000, 358000, 414000],
}


def convertCondtoConc(cond: float, compound: str) -> float:
    """ Converts conductivity (mS/cm) to concentration (M) using interpolation."""
    xVals = np.array(COND_TO_CONC[compound])
    yVals = np.array(COND_TO_CONC["conc"])
    ppm = np.interp(cond*1000, xVals, yVals)
    return ppm/(MOLAR_MASS[compound]*1000)


def groupData(data: list[dict], interval: int = 5) -> list[list[dict]]:
    """
    Groups data into intervals based on elapsed time from start of experiment.
    Default interval length is 5 minutes.
    """
    startTime = datetime.strptime(data[0]["Time"], "%Y/%m/%d %H:%M:%S")
    for entry in data:
        entry["ElapsedTime"] = (datetime.strptime(entry["Time"], "%Y/%m/%d %H:%M:%S") - startTime).total_seconds() / 60

    intervals = []
    currentGroup = []
    for entry in data:
        currentGroup.append(entry)
        if entry["ElapsedTime"] >= len(intervals) * interval + interval:
            intervals.append(currentGroup[:])
            currentGroup = []
    
    if currentGroup:
        intervals.append(currentGroup)
    
    return intervals


def computeCurrentEfficiency(data: list[dict], compound: str, finalVol: float, numTriplets: int) -> float:
    """ Calculates the current efficiency (%) for either HCl or NaOH."""
    dataField = C1_COND if compound == "HCL" else C2_COND

    groupedData = groupData(data)
    efficiencies = []

    initialConc = 0
    for i, group in enumerate(groupedData):
        timeInterval = (i + 1) * 5

        if i == 0:
            initialCondValues = np.array([entry[dataField] for entry in group])
            initialConc = convertCondtoConc(np.mean(initialCondValues), compound)
            continue
        
        currValues = np.array([entry[CURRENT] for entry in group])
        avgCurr = np.mean(currValues)

        if avgCurr == 0:
            efficiencies.append(0)
            continue
        
        condValues = np.array([entry[dataField] for entry in group])
        avgCond = np.mean(condValues)
        avgConc = convertCondtoConc(avgCond, compound)
        deltaConc = avgConc - initialConc
        currentEfficiency = (deltaConc * finalVol * FARADAY_CONSTANT) / (numTriplets * timeInterval * avgCurr * 60)
        efficiencies.append(currentEfficiency)

    overallEfficiency = np.mean(np.array(efficiencies)) * 100 if efficiencies else 0
    return overallEfficiency


def computeVoltageDropEfficiency(data: list[dict]) -> float:
    """ Calculates the voltage drop efficiency (%) for the given data."""
    groupedData = groupData(data)
    efficiencies = []

    for i, group in enumerate(groupedData):
        uStackValues = np.array([entry[VOLTAGE_STACK] for entry in group])
        avgUStack = np.mean(uStackValues)
        uTotalValues = np.array([entry[VOLTAGE_TOTAL] for entry in group])
        avgUTotal = np.mean(uTotalValues)

        if avgUTotal == 0:
            efficiencies.append(0)
            continue

        voltageDropEfficiency = (avgUStack / avgUTotal)
        efficiencies.append(voltageDropEfficiency)

    overallEfficiency = np.mean(np.array(efficiencies)) * 100 if efficiencies else 0
    return overallEfficiency


def computeReactionEfficiency(data: list[dict], volHCl: float, volNaOH: float) -> float:
    """ Calculates the reaction efficiency (%) for the last 5 minutes of the experiment."""

    condHClValues = np.array([entry[C1_COND] for entry in data])
    avgCondHCl = np.mean(condHClValues)
    condNaOHValues = np.array([entry[C2_COND] for entry in data])
    avgCondNaOH = np.mean(condNaOHValues)

    concHCl = convertCondtoConc(avgCondHCl, "HCL")
    concNaOH = convertCondtoConc(avgCondNaOH, "NaOH")
    
    reactionEfficiency = (concHCl * volHCl) / (concNaOH * volNaOH)
    return reactionEfficiency * 100


def computeOverallEfficiency(efficiencies: list) -> float:
    """ Calculates the overall efficiency (%) for a given experiment."""
    return np.mean(efficiencies) if len(efficiencies) == 4 else 0
