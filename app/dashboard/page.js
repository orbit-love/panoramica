import React from "react";
import { redirect } from "next/navigation";
import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { ApolloBaseWrapper } from "src/graphql/apollo-wrapper";
import { getSession } from "src/auth";
import DashboardPage from "app/dashboard/DashboardPage";
import LoadProjectsQuery from "./LoadProjects.gql";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const {
    data: { prismaProjects: projects },
  } = await getClient().query({
    query: LoadProjectsQuery,
  });

  const demoSite = !!process.env.DEMO_SITE;
  const props = {
    projects,
    demoSite,
    session,
  };

  return (
    <ApolloBaseWrapper>
      <DashboardPage {...props} />
    </ApolloBaseWrapper>
  );
}
