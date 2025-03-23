import numpy as np

from datetime import datetime

# constants
FARADAY_CONSTANT = 96485
MOLAR_MASS = {
    "HCL": 36.4609,
    "NaOH": 39.997
}

# lookup tables to interpolate conductivity -> conc
COND_TO_CONC = {
    "conc": [1, 3, 10, 30, 100, 300, 1000, 3000, 10000, 30000, 50000, 100000, 200000],
    "HCL": [11.7, 35, 116, 340, 1140, 3390, 11100, 32200, 103000, 283000, 432000, 709000, 850000], 
    "NaOH": [6.2, 18.4, 61.1, 182, 603, 1780, 5820, 16900, 53200, 144000, 223000, 358000, 414000],
}

def convertCondtoConc(cond: float, compound: str) -> float:
    """ 
    Converts a conductivity value to concentration (ppm) using interpolation, then
    converts ppm to M. 
    """
    x_vals = COND_TO_CONC[compound]
    y_vals = COND_TO_CONC["conc"]
    ppm = np.interp(cond*1000, x_vals, y_vals)
    return ppm/(MOLAR_MASS[compound]*1000)

def groupData(data, interval: int = 5) -> list:
    """Groups data into 5-minute intervals."""
    start_time = datetime.strptime(data[0]["Time"], "%Y/%m/%d %H:%M:%S")
    for entry in data:
        entry["ElapsedTime"] = (datetime.strptime(entry["Time"], "%Y/%m/%d %H:%M:%S") - start_time).total_seconds() / 60

    intervals = []
    current_group = []
    for entry in data:
        current_group.append(entry)
        if entry["ElapsedTime"] >= len(intervals) * interval + interval:
            intervals.append(current_group[:])
            current_group = []
    
    if current_group:
        intervals.append(current_group)
    
    return intervals

def computeCurrentEfficiency(data, compound: str, finalVol: float, numTriplets: int):
    """ Computes the current efficiency for either HCl or NaOH. """
    dataField = "C1 Cond" if compound == "HCL" else "C2 Cond"
    initialConc = convertCondtoConc(data[0][dataField], compound)

    groupedData = groupData(data)
    interval_effs = []

    for i, group in enumerate(groupedData):
        timeInterval = (i + 1) * 5
        if timeInterval == 5:
            continue

        avgCond = np.mean([entry[dataField] for entry in group])
        avgCurr = np.mean([entry["I Cmm"] for entry in group])

        if avgCurr == 0:
            interval_effs.append(0)
            continue

        avgConc = convertCondtoConc(avgCond, compound)
        deltaConc = avgConc - initialConc
        currentEfficiency = (deltaConc * finalVol * FARADAY_CONSTANT) / (numTriplets * timeInterval * avgCurr * 60)
        interval_effs.append(currentEfficiency)

    return np.mean(interval_effs) * 100 if interval_effs else 0

def computeVoltageDropEfficiency(data):
    """ Computes voltage drop efficiency. """
    groupedData = groupData(data)
    interval_effs = []

    for i, group in enumerate(groupedData):
        avgUStack = np.mean([entry["U Stac"] for entry in group])
        avgUTotal = np.mean([entry["U Cmm"] for entry in group])

        if avgUTotal == 0:
            interval_effs.append(0)
            continue

        voltageDropEfficiency = (avgUStack / avgUTotal)
        interval_effs.append(voltageDropEfficiency)

    return np.mean(interval_effs) * 100 if interval_effs else 0

def computeReactionEfficiency(data, volHCl, volNaOH):
    """ Computes reaction efficiency using final average concentrations and
    volumes. """

    avgCondHCl = np.mean([entry["C1 Cond"] for entry in data])
    avgCondNaOH = np.mean([entry["C2 Cond"] for entry in data])

    concHCl = convertCondtoConc(avgCondHCl, "HCL")
    concNaOH = convertCondtoConc(avgCondNaOH, "NaOH")
    
    reactionEfficiency = (concHCl * volHCl) / (concNaOH * volNaOH)
    return reactionEfficiency * 100

def computeOverallEfficiency(efficiencies):
    return np.mean(efficiencies) if len(efficiencies) == 4 else None
