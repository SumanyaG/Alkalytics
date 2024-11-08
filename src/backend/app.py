# app.py

from flask import Flask, request
from flask_graphql import GraphQLView
from graphql import build_schema
import graphql_server
from upload_service import CsvToMongoDB

app = Flask(__name__)
mongo_uri = "mongodb://localhost:27017/"
db_name = "experimental_data"
service = CsvToMongoDB(mongo_uri, db_name)

@app.route('/graphql', methods=['POST'])
def graphql():
    data = request.get_json()
    response = graphql_server.execute_sync(
        schema, data['query'], variable_values=data.get('variables')
    )
    return jsonify(response)

if __name__ == "__main__":
    app.run(port=5000)
