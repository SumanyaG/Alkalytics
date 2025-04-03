import math
from bson import ObjectId


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
