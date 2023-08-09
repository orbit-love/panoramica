import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { graph } from "src/data/db";
import { Neo4jGraphQL } from "@neo4j/graphql";

import typeDefs from "src/graphql/schemas";
import resolvers from "src/graphql/resolvers";

const server = async () => {
  const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver: graph,
    config: {
      driverConfig: {
        database: "memgraph",
      },
    },
  });

  const schema = await neoSchema.getSchema();

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          "request.credentials": "include",
        },
      }),
    ],
  });
  return apolloServer;
};

const getLoggedInUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};

const handler = startServerAndCreateNextHandler(await server(), {
  context: async (req, res) => ({
    req,
    res,
    user: await getLoggedInUser(),
  }),
});

export { handler as GET, handler as POST };
