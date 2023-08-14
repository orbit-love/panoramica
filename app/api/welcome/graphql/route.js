import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { graph } from "src/data/db";
import { Neo4jGraphQL } from "@neo4j/graphql";

import typeDefs from "src/graphql/welcome/schemas";
import resolvers from "src/graphql/welcome/resolvers";

const server = async () => {
  const key = process.env.NEXTAUTH_SECRET;
  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver: graph,
    features: {
      authorization: {
        key,
      },
    },
    config: {
      driverConfig: {
        database: "memgraph",
      },
    },
  });

  const schema = await neoSchema.getSchema();
  const apolloServer = new ApolloServer({
    schema,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  return apolloServer;
};

const handler = startServerAndCreateNextHandler(await server(), {
  context: async (req, res) => {
    return {
      req,
      res,
    };
  },
});

export { handler as GET, handler as POST };
