import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma, safeProjectSelectFields } from "src/data/db";
import { getActivities } from "src/data/graph/queries/conversations";
import { toPageContent } from "src/integrations/pinecone/embeddings";
import { prepareVectorStore } from "src/integrations/pinecone";

import SessionContext from "src/components/context/SessionContext";
import GraphConnection from "src/data/graph/Connection";
import ActivityPage from "app/projects/[id]/[activityId]/ActivityPage";
import { getEverything } from "src/data/graph/queries";
import { demoSession } from "src/auth";
import { aiReady, orbitImportReady } from "src/integrations/ready";
import { getActivity } from "src/data/graph/queries/conversations";

export async function generateMetadata({ params }) {
  // read route params
  const session = (await getServerSession(authOptions)) || demoSession();
  if (session?.user) {
    const { id, activityId } = params;
    const user = session.user;
    // get project and check if the user has access
    var project = await getProject(id, user);
    const graphConnection = new GraphConnection();
    var activity = await getActivity({
      graphConnection,
      activityId,
      projectId: id,
    });

    var summary = activity.summary || activity.text.slice(0, 50);

    return {
      title: `${summary} ${project.name}`,
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
      <ActivityPage {...props} />
    </SessionContext>
  );
}

export async function getProps(params) {
  const session = (await getServerSession(authOptions)) || demoSession();
  if (session?.user) {
    const { id, activityId } = params;
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
      let activity = await getActivity({
        graphConnection,
        activityId,
        projectId,
      });
      let similarConversations = await getSimilarConversations({
        project,
        activityId,
      });

      const safeProject = {};

      for (const field in safeProjectSelectFields()) {
        safeProject[field] = project[field];
      }

      safeProject.aiReady = aiReady(project);
      safeProject.orbitImportReady = orbitImportReady(project);

      return {
        session,
        project: safeProject,
        activity,
        similarConversations,
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

const getSimilarConversations = async ({ project, activityId }) => {
  var projectId = project.id;
  var conversationId = activityId;
  const graphConnection = new GraphConnection();
  var activities = await getActivities({
    projectId,
    conversationId,
    graphConnection,
  });
  var q = toPageContent(activities);

  var namespace = `project-conversations-${projectId}`;
  const vectorStore = await prepareVectorStore({ project, namespace });

  var vectorDocs = await vectorStore.similaritySearchWithScore(q, 25, {
    contentLength: { $gt: 150 },
  });

  // filter out the match for the conversation itself
  vectorDocs = vectorDocs.filter(([doc, _]) => doc.metadata.id != activityId);

  // get unique conversation ids from the vector docs
  const result = vectorDocs.map(([doc, score]) => ({
    ...doc.metadata,
    score,
  }));

  return result;
};

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
  return project;
};
