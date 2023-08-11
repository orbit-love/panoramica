import React from "react";
import Providers from "./Providers";
import { getSession } from "src/auth";
import { redirect } from "next/navigation";
import SiteHeader from "src/components/ui/SiteHeader";
import Link from "next/link";
import { getClient } from "src/graphql/apollo-client";
import GetProjectQuery from "./GetProject.gql";

export async function generateMetadata({ params }) {
  const project = await getProject(params.id);
  return project && { title: project.name };
}

export default async function WelcomeLayout({ params, children }) {
  const project = await getProject(params.id);
  const session = await getSession();
  if (!session || !project.demo) {
    redirect("/");
  }

  return (
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
      <div className="flex-col items-center pt-16 space-y-4 sm:flex-row sm:px-6">
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
  );
}

const getProject = async (id) => {
  const {
    data: { prismaProject: project },
  } = await getClient().query({
    query: GetProjectQuery,
    variables: {
      id,
    },
  });
  return project;
};
