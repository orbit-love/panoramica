import { HttpLink } from "@apollo/client";
import {
  NextSSRInMemoryCache,
  NextSSRApolloClient,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc";
import { headers as nextHeaders } from "next/headers";
import { setContext } from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      Cookie: nextHeaders().get("Cookie"),
    },
  };
});

const createClient = (uri) => {
  const { getClient } = registerApolloClient(() => {
    return new NextSSRApolloClient({
      cache: new NextSSRInMemoryCache(),
      link: authLink.concat(
        new HttpLink({
          uri,
          credentials: "same-origin",
          // you can disable result caching here if you want to
          // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
          fetchOptions: { cache: "no-store" },
        })
      ),
    });
  });
  return getClient;
};

export const getBaseClient = createClient(
  process.env.NEXT_PUBLIC_URL_SERVER_GRAPHQL
);
export const getWelcomeClient = createClient(
  process.env.NEXT_PUBLIC_URL_SERVER_WELCOME_GRAPHQL
);
