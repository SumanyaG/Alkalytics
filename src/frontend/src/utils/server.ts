import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import { json, urlencoded } from "body-parser"; 
import { resolvers, typeDefs } from "../graphql";

export async function startApolloServer() {
  /**
   * Initializes the Express app, configures Apollo Server with GraphQL schema,
   * sets up middleware, and starts the server on port 8000.
   *
   * @returns {express.Application} The Express app instance.
   */
  const app = express();

  app.use(json({ limit: "50mb" })); 
  app.use(urlencoded({ limit: "50mb", extended: true }));
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });

  try {
    await server.start();
    server.applyMiddleware({ app, cors: false });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(
        `Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("Error starting Apollo Server:", error);
    process.exit(1);
  }

  return app;
}

/**
 * Automatically starts the server if this file is executed directly.
 */
if (require.main === module) {
  startApolloServer().catch((error) => {
    console.error("Failed to start server:", error);
  });
}
