import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { getActivities } from "src/data/graph/queries/conversations";
import { toPageContent } from "src/integrations/pinecone/embeddings";
import { prepareVectorStore } from "src/integrations/pinecone";
import { getProject } from "app/projects/[id]/welcome/shared";

import GraphConnection from "src/data/graph/Connection";
import ConversationPage from "app/projects/[id]/welcome/[activityId]/ConversationPage";
import { demoSession } from "src/auth";
import { getActivity } from "src/data/graph/queries/conversations";

export async function generateMetadata({ params }) {
  // read route params
  const session = (await getServerSession(authOptions)) || demoSession();
  if (session?.user) {
    const { id: projectId, activityId } = params;
    // get project and check if the user has access
    const graphConnection = new GraphConnection();
    var activity = await getActivity({
      graphConnection,
      activityId,
      projectId,
    });

    var summary = activity.summary || activity.text.slice(0, 50);
    return {
      title: summary,
    };
  }
}

export default async function Page({ params }) {
  const props = await getProps(params);
  return <ConversationPage {...props} />;
}

export async function getProps(params) {
  const session = (await getServerSession(authOptions)) || demoSession();
  if (session?.user) {
    const { id: projectId, activityId } = params;
    const user = session.user;
    // get project and check if the user has access
    var project = await getProject(projectId, user, true);
    if (project) {
      const graphConnection = new GraphConnection();
      let activity = await getActivity({
        graphConnection,
        activityId,
        projectId,
      });
      let similarConversations = await getSimilarConversations({
        project,
        activityId,
      });

      return {
        activity,
        similarConversations,
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
