import { resolvers as uploadResolver, typeDefs as uploadType } from "./upload";
import { resolvers as queryResolver, typeDefs as queryType } from "./queries";
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

export const resolvers = [baseResolver, uploadResolver, queryResolver];
export const typeDefs = [baseType, uploadType, queryType];
