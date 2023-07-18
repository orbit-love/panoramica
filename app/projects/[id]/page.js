import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma, safeProjectSelectFields } from "src/data/db";

import SessionContext from "src/components/context/SessionContext";
import GraphConnection from "src/data/graph/Connection";
import ProjectPage from "app/projects/[id]/project-page";
import { getEverything } from "src/data/graph/queries";

export async function generateMetadata({ params }) {
  // read route params
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const { id } = params;
    const user = session.user;
    // get project and check if the user has access
    var project = await getProject(id, user);

    return {
      title: project.name,
    };
  }
}

export default async function Page({ params }) {
  const props = await getProps(params);
  if (!props.session) {
    redirect("/");
  }

  return (
    <SessionContext session={props.session}>
      <ProjectPage {...props} />
    </SessionContext>
  );
}

export async function getProps(params) {
  const session = await getServerSession(authOptions);
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
      let [threads, members, activities, connections] = await getEverything({
        projectId,
        graphConnection,
        from,
        to,
      });
      return {
        session,
        project,
        data: {
          threads,
          members,
          activities,
          connections,
        },
      };
    }
  }
  return {};
}

const getProject = async (id, user) => {
  let where = { id };
  if (!user.admin) {
    where.user = {
      email: user.email,
    };
  }
  // use an allowlist of fields to avoid sending back any API keys
  return prisma.project.findFirst({
    where,
    select: safeProjectSelectFields(),
  });
};