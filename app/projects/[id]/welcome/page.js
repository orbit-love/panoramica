import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma, safeProjectSelectFields } from "src/data/db";
import GraphConnection from "src/data/graph/Connection";
import { getEverything } from "src/data/graph/queries";

import SessionContext from "src/components/context/SessionContext";
import WelcomePage from "app/projects/[id]/welcome/WelcomePage";
import { demoSession } from "src/auth";
import { aiReady, orbitImportReady } from "src/integrations/ready";

export async function generateMetadata({ params }) {
  // read route params
  const session = (await getServerSession(authOptions)) || demoSession();
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
      <WelcomePage {...props} />
    </SessionContext>
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

const getProject = async (id, user) => {
  let where = { id };
  if (!user.admin) {
    where.OR = [
      {
        demo: true,
      },
      {
        user: { email: user.email },
      },
    ];
  }

  // use an allowlist of fields to avoid sending back any API keys
  const project = await prisma.project.findFirst({
    where,
  });

  if (project) {
    const safeProject = {};

    for (const field in safeProjectSelectFields()) {
      safeProject[field] = project[field];
    }

    safeProject.aiReady = aiReady(project);
    safeProject.orbitImportReady = orbitImportReady(project);

    return safeProject;
  }
};
