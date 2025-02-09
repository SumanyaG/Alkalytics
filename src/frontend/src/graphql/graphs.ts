import { gql } from "@apollo/client";
import axios from "axios";

export const typeDefs = gql`
  scalar JSON

  type Query {
    getCollectionAttrs(collection: String!): [String!]!
    getFilterCollectionData(attributes: [String!]!, collection: String!, dates:[String]): [JSON]!
    getLastestGraph(latest:Int):[JSON]
    }
    
    type Mutation {
      addGeneratedGraphs(graphType: String!, data:[JSON]!, properties:[JSON]!): String!
   }
`;

export const resolvers = {
  Query: {
    getCollectionAttrs: async (
        _: undefined,
        { collection }: { collection: string }
      ):Promise<Record<string, any>> => {
        try {
          const response = await axios.post("http://127.0.0.1:8000/getAttrs", {collection: collection}, {
            headers: { "Content-Type": "application/json" },
          });
          if (response.data.status === "success") {
            return response.data.data; 
          } else {
            throw new Error("No document found in the collection.");
          }
        } catch (error) {
          console.error(
            "Error fetching data of the given collection:",
            error instanceof Error ? error.message : error
          );
          throw new Error("Failed to fetch data of the given collection.");
        }
      },
  
      getFilterCollectionData: async (
        _: undefined,
        { attributes, collection, dates }: { attributes: string[]; collection: string, dates: string[] }
      ):Promise<Record<string, any>> => {
        try {
          const response = await axios.post("http://127.0.0.1:8000/filterCollectionData", {attributes, collection, dates}, {
            headers: { "Content-Type": "application/json" },
          });
          if (response.data.status === "success") {
            return response.data.data; 
          } else {
            throw new Error("No data has the given attributes.");
          }
        } catch (error) {
          console.error(
            "Error fetching experiment with given attributes:",
            error instanceof Error ? error.message : error
          );
          throw new Error("Failed to fetch experiment with given attributes.");
        }
      },
        getLastestGraph: async(
          _:undefined,
          {latest}:{latest:Number}):Promise<any> => {
            try {
              const response = await axios.post("http://127.0.0.1:8000/generatedGraphs/latest", {latest}, {
                headers: { "Content-Type": "application/json" },
              });
              if (response.data) {
                return response.data; 
              } else {
                throw new Error("No graphs have been saved");
              }
            } catch (error) {
              console.error(
                "Error fetching saved graph data:",
                error instanceof Error ? error.message : error
              );
              throw new Error("Failed to fetch saved graph data.");
            }
          },
  },
  Mutation: {
    addGeneratedGraphs: async(
        _:undefined,
        {graphType, data, properties}:{graphType: string, data:[], properties:[]}):Promise<string> => {
            try {
            const response = await axios.put("http://127.0.0.1:8000/generatedGraphs", {graphType, data, properties}, {
              headers: { "Content-Type": "application/json" },
            });

            if (response.data.status === "success") {
              return response.data.message; 
            } else {
              throw new Error("Unable to save graph");
            }

          } catch (error) {
            console.error(
              "Error adding graph:",
              error instanceof Error ? error.message : error
            );
            throw new Error("Failed to fetch experiment with given attributes.");
          }
        },
    }
}