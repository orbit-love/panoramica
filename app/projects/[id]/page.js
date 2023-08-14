import React from "react";
import { redirect } from "next/navigation";
import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { ApolloBaseWrapper } from "src/graphql/apollo-wrapper";
import { getSession } from "src/auth";
import ProjectPage from "app/projects/[id]/ProjectPage";
import GetPrismaProjectQuery from "./GetPrismaProject.gql";

const getProject = async (id) => {
  const {
    data: { prismaProject: project },
  } = await getClient().query({
    query: GetPrismaProjectQuery,
    variables: {
      id,
    },
  });
  return project;
};

export async function generateMetadata({ params }) {
  const project = await getProject(params.id);
  return project && { title: project.name };
}

export default async function Page({ params }) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  const project = await getProject(params.id);
  return (
    <ApolloBaseWrapper>
      <ProjectPage project={project} />
    </ApolloBaseWrapper>
  );
}
