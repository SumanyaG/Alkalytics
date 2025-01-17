import { resolvers as uploadResolver, typeDefs as uploadType } from "./upload";
import { gql } from "apollo-server-express";

const baseType = gql`
  type Query {
    hello: String
  }
`;
const baseResolver = {
  Query: {
    hello: () => "Hello, world!",
  },
};

export const resolvers = [baseResolver, uploadResolver];
export const typeDefs = [baseType, uploadType];
