import React from "react";
import { redirect } from "next/navigation";
import { getBaseClient as getClient } from "src/graphql/apollo-client";
import { ApolloBaseWrapper } from "src/graphql/apollo-wrapper";
import { getSession } from "src/auth";
import ProjectPage from "app/projects/[id]/ProjectPage";
import GetPrismaProjectQuery from "./GetPrismaProject.gql";
import GetProjectQuery from "src/graphql/queries/GetProject.gql";

export async function generateMetadata({ params }) {
  const project = await getProject(params.id);
  return project && { title: project.name };
}

export default async function Page({ params }) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  const prismaProject = await getPrismaProject(params.id);
  const graphProject = await getProject(params.id);

  // merge the properties from the graph project node
  // with the prisma project for now
  const project = {
    ...prismaProject,
    properties: graphProject.properties,
  };

  return (
    <ApolloBaseWrapper>
      <ProjectPage project={project} />
    </ApolloBaseWrapper>
  );
}

const getPrismaProject = async (id) => {
  const {
    data: { prismaProject },
  } = await getClient().query({
    query: GetPrismaProjectQuery,
    variables: {
      id,
    },
  });
  return prismaProject;
};

const getProject = async (id) => {
  const {
    data: {
      projects: [project],
    },
  } = await getClient().query({
    query: GetProjectQuery,
    variables: {
      id,
    },
  });
  return project;
};
