"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  NextSSRApolloClient,
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { setVerbosity } from "ts-invariant";

if (process.env.NODE_ENV === "development") {
  setVerbosity("debug");
  loadDevMessages();
  loadErrorMessages();
}

function buildClient(uri) {
  return function makeClient() {
    const httpLink = new HttpLink({
      uri,
      credentials: "same-origin",
    });

    return new NextSSRApolloClient({
      cache: new NextSSRInMemoryCache({}),
      link:
        typeof window === "undefined"
          ? ApolloLink.from([
              // in a SSR environment, if you use multipart features like
              // @defer, you need to decide how to handle these.
              // This strips all interfaces with a `@defer` directive from your queries.
              new SSRMultipartLink({
                stripDefer: true,
              }),
              httpLink,
            ])
          : httpLink,
    });
  };
}

export function ApolloBaseWrapper({ children }) {
  var uri = process.env.NEXT_PUBLIC_URL_SERVER_GRAPHQL;
  return (
    <ApolloNextAppProvider makeClient={buildClient(uri)}>
      {children}
    </ApolloNextAppProvider>
  );
}
export function ApolloWelcomeWrapper({ children }) {
  var uri = process.env.NEXT_PUBLIC_URL_SERVER_WELCOME_GRAPHQL;
  return (
    <ApolloNextAppProvider makeClient={buildClient(uri)}>
      {children}
    </ApolloNextAppProvider>
  );
}
