import { resolvers as uploadResolver, typeDefs as uploadType } from "./upload";
import { resolvers as queryResolver, typeDefs as queryType } from "./queries";
import { resolvers as tableResolver, typeDefs as tableType } from "./table";
import { resolvers as authResolver, typeDefs as authType } from "./auth";
import { resolvers as graphResolver, typeDefs as graphType } from "./graphs";
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

export const resolvers = [
  baseResolver,
  uploadResolver,
  queryResolver,
  tableResolver,
  authResolver,
  graphResolver
];
export const typeDefs = [baseType, uploadType, queryType, tableType, authType, graphType];
