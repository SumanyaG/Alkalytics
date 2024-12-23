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
experiment_file_path = "../data/Experiments.xlsx"

data_file_paths = ["../data/20240604.xlsx",
                    "../data/20240729 - 1.xlsx",
                   "../data/20240729 - 4.xlsx","../data/20240802 (1).xlsx", 
                   "../data/20240802 (2).xlsx", "../data/20240802.xlsx",
                    "../data/20240803 (1).xlsx", "../data/20240804.xlsx", 
                    "../data/20240809.xlsx",  
                    "../data/20240813.xlsx", 
                    "../data/20240814.xlsx", "../data/20240815.xlsx", 
                    "../data/20240816.xlsx", "../data/20240819.xlsx", 
                    "../data/20240820.xlsx", "../data/20240821.xlsx",
                    "../data/20240828.xlsx", "../data/20240831.xlsx", 
                    "../data/20240901 (1).xlsx", "../data/20240901.xlsx",
                    "../data/20240903 (1).xlsx", "../data/20240903.xlsx",
                    "../data/20240904.xlsx", "../data/20240905 (1).xlsx", 
                    "../data/20240906 (1).xlsx", "../data/20240906.xlsx", 
                    "../data/20240923 (1).xlsx", "../data/20240923.xlsx",
                    "../data/20240925.xlsx", "../data/20240926.xlsx",
                    "../data/20240604.xlsx",
                    "../data/20240726.xlsx",
                    "../data/20240729 - 2.xlsx",
                    "../data/20240729 - 3.xlsx", 
                    "../data/20240812.xlsx",
                    "../data/20240814 (1).xlsx",
                ]


print("----------------------------------- MIGRATING ----------------------------------")
# Run migration
migration_service.migrate(experimentFilePath=experiment_file_path, dataFilePaths=data_file_paths)

print("--------------------------- DONE, CLOSING CONNECTION ---------------------------")
# Close the MongoDB connection
migration_service.closeConnection()
