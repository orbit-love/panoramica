import React from "react";
import { gql } from "graphql-tag";
import { getClient } from "src/graphql/apollo-client";
import { redirect } from "next/navigation";
import { getSession } from "src/auth";
import ProjectPage from "app/projects/[id]/ProjectPage";

const GET_PROJECT = gql`
  query ($id: ID!) {
    prismaProject(id: $id) {
      id
      name
      demo
      prismaUser {
        email
      }
    }
  }
`;

const getProject = async (id) => {
  const {
    data: { prismaProject: project },
  } = await getClient().query({
    query: GET_PROJECT,
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
  return <ProjectPage project={project} />;
}
