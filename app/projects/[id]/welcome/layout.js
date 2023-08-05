import React from "react";
import Providers from "./Providers";
import GraphConnection from "src/data/graph/Connection";
import { getServerSession } from "next-auth/next";
import { demoSession } from "src/auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { getEverything } from "src/data/graph/queries";
import { getProject } from "./shared";
import { redirect } from "next/navigation";
import SiteHeader from "src/components/ui/SiteHeader";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const session = (await getServerSession(authOptions)) || demoSession();
  if (session?.user) {
    const { id } = params;
    const user = session.user;
    var project = await getProject(id, user);
    return {
      title: {
        absolute: `Home — ${project.name}`,
        template: `%s — ${project.name}`,
      },
    };
  }
}

export default async function WelcomeLayout({ params, children }) {
  const props = await getProps(params);
  const { project, session } = props;
  if (!session) {
    redirect("/");
  }
  return (
    <Providers {...props}>
      <SiteHeader hideLogo />
      <div className="flex-col items-center pt-16 space-y-4 sm:flex-row sm:px-6">
        <div className="text-3xl font-bold text-center">
          <Link
            href={`/projects/${project.id}/welcome`}
            className="hover:text-tertiary"
          >
            {project.name}
          </Link>
        </div>
        {children}
      </div>
    </Providers>
  );
}

export async function getProps(params) {
  const session = (await getServerSession(authOptions)) || demoSession();
  if (session?.user) {
    const { id } = params;
    const user = session.user;
    // get project and check if the user has access
    var project = await getProject(id, user);
    if (project) {
      var projectId = project.id;
      var from = "1900-01-01";
      var to = "2100-01-01";
      const graphConnection = new GraphConnection();
      let [conversations, members, activities, connections] =
        await getEverything({
          projectId,
          graphConnection,
          from,
          to,
        });
      return {
        session,
        project,
        data: {
          conversations,
          members,
          activities,
          connections,
        },
      };
    }
  }
  return {};
}
