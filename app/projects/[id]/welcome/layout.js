import React from "react";
import Providers from "./Providers";
import { getSession } from "src/auth";
import { redirect } from "next/navigation";
import SiteHeader from "src/components/ui/SiteHeader";
import Link from "next/link";
import { getWelcomeClient as getClient } from "src/graphql/apollo-client";
import { ApolloWelcomeWrapper } from "src/graphql/apollo-wrapper";
import GetProjectQuery from "src/graphql/queries/GetProject.gql";

export async function generateMetadata({ params }) {
  const project = await getProject(params.id);
  return project && { title: project.name };
}

export default async function WelcomeLayout({ params, children }) {
  const project = await getProject(params.id);
  if (!project.demo) {
    redirect("/");
  }

  // the session is just for the header
  const session = await getSession();

  return (
    <ApolloWelcomeWrapper>
      <Providers project={project} session={session}>
        <SiteHeader hideLogo>
          <Link
            href={`/projects/${project.id}`}
            target="_blank"
            className="hover:underline"
          >
            Manage Project
          </Link>
        </SiteHeader>
        <div className="flex-col items-center space-y-4 sm:flex-row sm:px-6">
          <div className="text-3xl font-bold text-center">
            <Link
              href={`/projects/${project.id}/welcome`}
              className="hover:underline"
            >
              {project.name}
            </Link>
          </div>
          {children}
        </div>
      </Providers>
    </ApolloWelcomeWrapper>
  );
}

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
