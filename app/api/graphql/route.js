import { ApolloServer } from "@apollo/server";
import jwt from "jsonwebtoken";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { graph } from "src/data/db";
import { Neo4jGraphQL } from "@neo4j/graphql";

const secret = process.env.NEXTAUTH_SECRET;

import typeDefs from "src/graphql/schemas";
import resolvers from "src/graphql/resolvers";

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
  context: async () => {
    const user = await getLoggedInUser();
    var token;
    if (user) {
      var roles = user.admin ? ["admin"] : [];
      var payload = { sub: user.id, roles };
      token = jwt.sign(payload, secret);
    }
    return {
      token,
      user,
    };
  },
});

export { handler as GET, handler as POST };
