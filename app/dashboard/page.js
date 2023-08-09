import React from "react";
import { redirect } from "next/navigation";
import { gql } from "graphql-tag";
import { getSession } from "src/auth";
import DashboardPage from "app/dashboard/DashboardPage";
import { getClient } from "src/graphql/apollo-client";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

const LOAD_PROJECTS = gql`
  query {
    prismaProjects {
      id
      name
      user {
        email
      }
    }
  }
`;

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const {
    data: { prismaProjects: projects },
  } = await getClient().query({
    query: LOAD_PROJECTS,
  });

  const demoSite = !!process.env.DEMO_SITE;
  const props = {
    projects,
    demoSite,
    session,
  };

  return <DashboardPage {...props} />;
}
