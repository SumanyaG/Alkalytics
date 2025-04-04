import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()


def getConnection(collection: str):
    MONGO_URI = os.getenv("CONNECTION_STRING")
    DB_NAME = "alkalyticsDB"
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[collection]
    return {"collection": collection, "client": client}
