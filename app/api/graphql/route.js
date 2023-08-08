import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

import typeDefs from "src/graphql/schemas";
import resolvers from "src/graphql/resolvers";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      settings: {
        "request.credentials": "include",
      },
    }),
  ],
});

const getLoggedInUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({
    req,
    res,
    user: await getLoggedInUser(),
  }),
});

export { handler as GET, handler as POST };
