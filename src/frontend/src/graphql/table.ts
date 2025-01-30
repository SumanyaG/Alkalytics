import { gql } from "@apollo/client";
import axios from "axios";

export const typeDefs = gql`
  scalar JSON

  type Mutation {
    updateParam(expId: String!, updatedParams: JSON!): String!
    addColumn(columnName: String!, defaultValue: JSON): String!
    addRow(rowData: JSON!): String!
    removeColumn(columnName: String!): String!
    removeRow(experimentIds: [String]!): String!
  }
`;

export const resolvers = {
  Mutation: {
    updateParam: async (
      _: undefined,
      { expId, updatedParams }: { expId: string; updatedParams: any }
    ): Promise<string> => {
      try {
        const response = await axios.put(
          "http://127.0.0.1:8000/update-param",
          { expId, updatedParams },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to update data.");
        }
      } catch (error) {
        console.error(
          "Error updating data:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to update data.");
      }
    },

    addColumn: async (
      _: undefined,
      { columnName, defaultValue }: { columnName: string; defaultValue: any }
    ): Promise<string> => {
      try {
        const response = await axios.put(
          "http://127.0.0.1:8000/experiments/add-column",
          { columnName, defaultValue },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to add column.");
        }
      } catch (error) {
        console.error(
          "Error adding column:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to add column.");
      }
    },

    addRow: async (
      _: undefined,
      { rowData }: { rowData: any }
    ): Promise<string> => {
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/experiments/add-row",
          { rowData },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to add row.");
        }
      } catch (error) {
        console.error(
          "Error adding row:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to add row.");
      }
    },

    removeColumn: async (
      _: undefined,
      { columnName }: { columnName: string }
    ): Promise<string> => {
      try {
        const response = await axios.put(
          "http://127.0.0.1:8000/experiments/remove-column",
          { columnName },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to remove column.");
        }
      } catch (error) {
        console.error(
          "Error removing column:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to remove column.");
      }
    },

    removeRow: async (
      _: undefined,
      { experimentIds }: { experimentIds: string[] }
    ): Promise<string> => {
      try {
        const response = await axios.delete(
          "http://127.0.0.1:8000/experiments/remove-rows",
          {
            data: { experimentIds },
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to remove row.");
        }
      } catch (error) {
        console.error(
          "Error removing row:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to remove row.");
      }
    },
  },
};
