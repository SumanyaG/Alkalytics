import { gql } from "@apollo/client";
import axios from "axios";
import { DataRow } from "../components/table/Table";

export const typeDefs = gql`
  scalar JSON

  type Query {
    getColumnTypes: [JSON]!
  }

  type Mutation {
    updateData(updatedData: JSON!): String!
    addColumn(columnName: String!, defaultValue: JSON): String!
    addRow(rowData: JSON!): String!
    removeColumn(columnName: String!): String!
    removeRow(experimentIds: [String]!): String!
    setColumnTypes(newColumnTypes: JSON!): String!
    computeEfficiency(experimentId: String!, selectedEfficiencies: [String!]!, timeInterval: Int!): String!
  }
`;

export const resolvers = {
  Query: {
    getColumnTypes: async (): Promise<Record<string, string>[]> =>  {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/columntypes",
          { headers: { "Content-Type": "application/json" }}
        )
        if (response.data.status === "success") {
          return response.data.data;
        } else {
          throw new Error("Failed to retrieve column types.");
        }
      } catch (error) {
        console.error(
          "Error retrieving column types: ", 
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to retrieve column types.");
      }
    }
  },
  Mutation: {
    updateData: async (
      _: undefined,
      { updatedData }: { updatedData: Record<string, DataRow> }
    ): Promise<string> => {
      try {
        const response = await axios.put(
          "http://127.0.0.1:8000/update-data",
          { updatedData },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to update rows.");
        }
      } catch (error) {
        console.error(
          "Error updating rows:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to update rows.");
      }
    },

    addColumn: async (
      _: undefined,
      {
        columnName,
        defaultValue,
      }: {
        columnName: string;
        defaultValue: string | number | undefined | null;
      }
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
      { rowData }: { rowData: DataRow }
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

    setColumnTypes: async (
      _: undefined,
      { newColumnTypes }: { newColumnTypes: Record<string, string> }
    ): Promise<string> => {
      try {
        const response = await axios.put(
          "http://127.0.0.1:8000/update-column-types",
          { newColumnTypes },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status === "success") {
          return response.data.message;
        } else {
          throw new Error("Failed to update column types.");
        }
      } catch (error) {
        console.error(
          "Error updating column types:",
          error instanceof Error ? error.message : error
        );
        throw new Error("Failed to update column types.");
      }
    },

    computeEfficiency: async (
      _: undefined,
      { experimentId, selectedEfficiencies, timeInterval }: { experimentId: string, selectedEfficiencies: string[], timeInterval: number }
    ): Promise<string> => {
      try {
        const response = await axios.post("http://127.0.0.1:8000/calculate-efficiencies",
          { experimentId, selectedEfficiencies, timeInterval },
          { headers: { "Content-Type": "application/json" }}
        );

        if (response.data.status === "success" || response.data.status === "repeated") {
          return response.data.message;
        } else {
          throw new Error("Failed to compute efficiencies.");
        }
      } catch (error) {
        console.error("Error computing efficiencies: ", error instanceof Error ? error.message : error);
        throw new Error("Failed to compute efficiencies.")
      };
    }
  },
};
