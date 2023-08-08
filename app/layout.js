import React from "react";
import "styles/globals.css";
import { ApolloWrapper } from "src/graphql/apollo-wrapper";
import SessionContext from "src/components/context/SessionContext";
import Icons from "src/components/context/Icons";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

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
  const demoSite = !!process.env.DEMO_SITE;
  var session = await getServerSession(authOptions);
  if (!session && demoSite) {
    session = demoSession();
  }

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
