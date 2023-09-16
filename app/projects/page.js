import React from "react";
import { redirect } from "next/navigation";
import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { ApolloBaseWrapper } from "src/graphql/apollo-wrapper";
import { getSession } from "src/auth";
import ProjectsPage from "app/projects/ProjectsPage";
import GetPrismaProjectsQuery from "src/graphql/queries/GetPrismaProjects.gql";

export const metadata = {
  title: "Projects",
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
    query: GetPrismaProjectsQuery,
  });

  const demoSite = !!process.env.DEMO_SITE;
  const props = {
    projects,
    demoSite,
    session,
  };

  return (
    <ApolloBaseWrapper>
      <ProjectsPage {...props} />
    </ApolloBaseWrapper>
  );
}
