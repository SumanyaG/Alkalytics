import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv('CONNECTION_STRING'))

try:
    client.admin.command('ping')
    print("Successfully connected.")
except Exception as e:
    print("Connection failed:", e)

db = client["alkalyticsDB"]
