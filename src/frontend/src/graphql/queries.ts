import { gql } from "@apollo/client";
import axios from "axios";

export const typeDefs = gql`
  scalar JSON

  type Query {
    getExperimentIds: [String!]!
    getExperiments: [JSON]!
    getData(experimentId: String!): [JSON]!
    getCollectionAttrs(collection: String!): [String!]!
    getFilterCollectionData(attributes: [String!]!, collection: String!, dates:[String]): [JSON]!
  }
`;

export const resolvers = {
  Query: {
    getExperimentIds: async (): Promise<string[]> => {
      try {
        const response = await axios.get<{ experimentIds: string[] }>(
          "http://127.0.0.1:8000/experimentIds"
        );
        return response.data.experimentIds;
      } catch (error) {
        console.error(
          "Error fetching experiments:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to fetch experiments.");
      }
    },

    getData: async (
      _: undefined,
      { experimentId }: { experimentId: string }
    ) => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/data",
          { experimentId: experimentId },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.data;
        } else {
          throw new Error("No data found for the given experimentId.");
        }
      } catch (error) {
        console.error(
          "Error fetching experiment data:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to fetch experiment data.");
      }
    },

    getExperiments: async (): Promise<Record<string, any>[]> => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/experiments", {
          headers: { "Content-Type": "application/json" },
        });
        if (response.data.status === "success") {
          return response.data.data;
        } else {
          throw new Error("No experiments found.");
        }
      } catch (error) {
        console.error(
          "Error fetching experiments:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to fetch experiments.");
      }
    },

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
      console.log(dates)
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
  },
};
