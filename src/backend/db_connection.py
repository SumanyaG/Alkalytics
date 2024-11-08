import os
from migrationService import MigrationService
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Retrieve MongoDB URI and Database Name from environment
mongo_uri = os.getenv("CONNECTION_STRING")
db_name = "alkalyticsDB"  # Replace with your actual database name

# Initialize MigrationService
migration_service = MigrationService(mongo_uri, db_name)
# Define paths to your experiment and data sheet Excel files
experiment_file_path = "../../src/data/Experiments.xlsx"
data_file_paths = ["../../src/data/20240802.xlsx"]

print("----------------------------------- MIGRATING ----------------------------------")
# Run migration
migration_service.migrate(experimentFilePath=experiment_file_path, dataFilePaths=data_file_paths)

print("--------------------------- DONE, CLOSING CONNECTION ---------------------------")
# Close the MongoDB connection
migration_service.closeConnection()
