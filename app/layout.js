import React from "react";
import "styles/globals.css";
import { ApolloWrapper } from "src/graphql/apollo-wrapper";
import SessionContext from "src/components/context/SessionContext";
import Icons from "src/components/context/Icons";
import { getSession } from "src/auth";

var description = "Expand conversational landscapes with AI";
var defaultTitle = "Panoramica";
var template = "%s — Panoramica";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL),
  title: {
    template,
    default: defaultTitle,
  },
  description,
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <Icons>
      <ApolloWrapper>
        <SessionContext session={session}>
          <html>
            <body>{children}</body>
          </html>
        </SessionContext>
      </ApolloWrapper>
    </Icons>
  );
}
