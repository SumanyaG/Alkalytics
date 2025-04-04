import { gql } from "@apollo/client";
import axios from "axios";

export const typeDefs = gql`
  scalar JSON

  type filterCollectionDataResponse {
    data: [JSON]!
    analysisRes: [JSON]
  }

  type Query {
    getCollectionAttrs(collection: String!): [String!]!
    getFilterCollectionData(attributes: [String!]!, collection: String!, dates: [String], analysis: Boolean): filterCollectionDataResponse
    getFilterCollectionDates(attribute: String!, collection: String!, filterValue: JSON!): [String!]!
    getFilterCollectionAttrValues(attribute: String!, collection: String!): [JSON]
    getLastestGraph(latest:Int):[JSON]
    }
    
    type Mutation {
      addGeneratedGraphs(graphType: String!, data:[JSON]!, properties:[JSON]!, attributes: [String!]!): String!
      removeGraph(graphId: Int!): String!
   }
`;

export type filterCollectionDataResponse = {
  data: JSON[];
  analysisRes?: JSON[];
}

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
        { attributes, collection, dates, analysis }: { attributes: string[], collection: string, dates: string[], analysis?: Boolean }
      ):Promise<filterCollectionDataResponse> => {
        try {
          const response = await axios.post("http://127.0.0.1:8000/filterCollectionData", {attributes, collection, dates, analysis}, {
            headers: { "Content-Type": "application/json" },
          });
          if (response.data.status === "success") {
            return {
              data: response.data.data || [],
              analysisRes: analysis
              ? response.data.analysisRes !== "error" 
                ? response.data.analysisRes || []
                : []
              : []
            };
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
      getFilterCollectionDates: async (
        _: undefined,
        { attribute, collection, filterValue }: { attribute: string; collection: string, filterValue: string | number }
      ):Promise<any> => {
        try {
          const response = await axios.post("http://127.0.0.1:8000/getFilterCollectionDates", {attribute, collection, filterValue}, {
            headers: { "Content-Type": "application/json" },
          });
          if (response.data.status === "success") {
            return response.data.data || [];
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
      getFilterCollectionAttrValues: async (
        _: undefined,
        { attribute, collection}: { attribute: string; collection: string}
      ):Promise<any> => {
        try {
          const response = await axios.post("http://127.0.0.1:8000/filterCollectionData/attrValues", {attribute, collection}, {
            headers: { "Content-Type": "application/json" },
          });
          if (response.data.status === "success") {
            return response.data.data || []
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
        {graphType, data, properties, attributes}:{graphType: string, data:[], properties:[], attributes: string[]}):Promise<string> => {
            try {
            const response = await axios.put("http://127.0.0.1:8000/generatedGraphs", {graphType, data, properties, attributes}, {
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
        removeGraph: async (
          _: undefined,
          { graphId }: { graphId: number }
        ): Promise<string> => {
          try {
            const response = await axios.delete(
              "http://127.0.0.1:8000/generatedGraphs/remove-graph",
              {
                data: { graphId },
                headers: { "Content-Type": "application/json" },
              }
            );
    
            if (response.data.status === "success") {
              return response.data.message;
            } else {
              throw new Error("Failed to remove graph.");
            }
          } catch (error) {
            console.error(
              "Error removing graph:",
              error instanceof Error ? error.message : error
            );
            throw new Error("Failed to remove graph.");
          }
        },
    }
}