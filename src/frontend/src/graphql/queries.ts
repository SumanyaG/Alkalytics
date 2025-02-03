import { gql } from "@apollo/client";
import axios from "axios";
import { DataRow } from "../components/table/Table";

export const typeDefs = gql`
  scalar JSON

  type Query {
    getExperimentIds: [String!]!
    getExperiments: [JSON]!
    getData(experimentId: String!): [JSON]!
    getExperimentAttrs: [String!]!
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

    getExperiments: async (): Promise<Record<string, DataRow>[]> => {
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

    getExperimentAttrs: async ():Promise<Record<string, any>> => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/experiments/getAttrs", {
          headers: { "Content-Type": "application/json" },
        });
        if (response.data.status === "success") {
          return response.data.data; 
        } else {
          throw new Error("No document found in the collection.");
        }
      } catch (error) {
        console.error(
          "Error fetching experiment attributes:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to fetch experiment attributes.");
      }
    },
  },
};
