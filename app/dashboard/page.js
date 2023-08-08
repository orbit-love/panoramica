import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { gql } from "graphql-tag";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { demoSession } from "src/auth";
import DashboardPage from "app/dashboard/DashboardPage";
import { getClient } from "src/graphql/apollo-client";

export const metadata = {
  title: "Dashboard",
};

const query = gql`
  query {
    projects {
      id
      name
      user {
        email
      }
    }
  }
`;

export const dynamic = "force-dynamic";

export default async function Page() {
  const demoSite = !!process.env.DEMO_SITE;
  var session = await getServerSession(authOptions);
  if (!session) {
    if (demoSite) session = demoSession();
    else redirect("/");
  }

  const {
    data: { projects },
  } = await getClient().query({
    query,
  });

  const props = {
    projects,
    demoSite,
    session,
  };

  return <DashboardPage {...props} />;
}
