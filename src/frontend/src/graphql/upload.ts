import { gql } from "@apollo/client";
import axios from "axios";

export const typeDefs = gql`
  input Base64FileInput {
    filename: String!
    mimetype: String!
    content: String!
    linkedId: String
  }

  type Base64File {
    filename: String!
    mimetype: String!
    content: String!
  }

  type AmbiguousData {
    dataId: String!
    dataFile: Base64File
    matchingExp: [String!]!
  }

  type UploadResponse {
    status: String!
    message: String!
    ambiguousData: [AmbiguousData]
  }

  type Mutation {
    upload(
      experimentFiles: [Base64FileInput!]!
      dataFiles: [Base64FileInput!]!
    ): UploadResponse!
    manualUpload(linkedData: [Base64FileInput!]!): UploadResponse!
  }
`;

export type Base64FileInput = {
  filename: string;
  mimetype: string;
  content: string;
};

export type AmbiguousData = {
  dataId: string;
  dataFile?: any;
  matchingExp: string[];
};

export type UploadResponse = {
  status: string;
  message: string;
  ambiguousData?: AmbiguousData[];
};

const validateFiles = (files: Base64FileInput[]) => {
  for (const file of files) {
    if (!file.filename || typeof file.filename !== "string") {
      throw new Error(`Invalid filename for file: ${file.filename}`);
    }
    if (!file.mimetype || typeof file.mimetype !== "string") {
      throw new Error(`Invalid mimetype for file: ${file.filename}`);
    }
    if (!file.content || typeof file.content !== "string") {
      throw new Error(`Invalid base64 content for file: ${file.filename}`);
    }
  }
};

export const resolvers = {
  Mutation: {
    upload: async (
      _: unknown,
      {
        experimentFiles,
        dataFiles,
      }: {
        experimentFiles: Base64FileInput[];
        dataFiles: Base64FileInput[];
      }
    ): Promise<UploadResponse> => {
      try {
        validateFiles(experimentFiles);
        validateFiles(dataFiles);

        const response = await axios.post(
          "http://127.0.0.1:8000/upload",
          {
            experimentFiles,
            dataFiles,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        return {
          status: response.data.status,
          message: response.data.message,
          ambiguousData: response.data.ambiguousData || [],
        };
      } catch (error: any) {
        console.error("Error during file upload:", error.message);
        throw new Error("Failed to upload and process the files.");
      }
    },

    manualUpload: async (
      _: unknown,
      {
        linkedData,
      }: {
        linkedData: Base64FileInput[];
      }
    ): Promise<UploadResponse> => {
      try {
        validateFiles(linkedData);

        const response = await axios.post(
          "http://127.0.0.1:8000/manual-upload",
          {
            linkedData,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return {
          status: response.data.status,
          message: response.data.message,
          ambiguousData: [],
        };
      } catch (error: any) {
        console.error("Error during file upload:", error.message);
        throw new Error("Failed to upload and process the files.");
      }
    },
  },
};
