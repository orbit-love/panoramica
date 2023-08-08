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

import { defaultDataIdFromObject } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_URL_SERVER_GRAPHQL,
    credentials: "same-origin",
  });

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache({
      typePolicies: {
        Project: {
          fields: {
            activitiesConnection: relayStylePagination(),
            membersConnection: relayStylePagination(),
          },
        },
        Member: {
          fields: {
            activitiesConnection: relayStylePagination(),
          },
        },
      },
      // dataIdFromObject(responseObject) {
      //   var id = defaultDataIdFromObject(responseObject);
      //   console.log("JOSH", id, responseObject);
      //   return id;
      // },
    }),
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
}

export function ApolloWrapper({ children }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
