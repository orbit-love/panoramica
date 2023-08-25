import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { getActivities } from "src/data/graph/queries";
import GraphConnection from "src/data/graph/Connection";
import {
  deleteAllIndexedConversations,
  indexConversations,
} from "src/integrations/typesense";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user });
    var projectId = project.id;
    if (!project) {
      return;
    }

    if (project.userId != user.id && !user.admin) {
      return;
    }

    if (!aiReady(project)) {
      res.status(400).json({
        message: "Please set model and vector store API keys on the project",
      });
      return;
    }

    await deleteAllIndexedConversations({ project });

    // create embeddings for all activities
    const graphConnection = new GraphConnection();
    const activities = await getActivities({
      graphConnection,
      projectId,
    });

    // create a map of conversations and activities for
    // conversation-level embeds
    // reverse the activities so that the earliest activities will
    // be added to the map below first
    const conversations = {};
    for (let activity of activities) {
      if (!conversations[activity.conversationId]) {
        conversations[activity.conversationId] = [];
      }
      conversations[activity.conversationId].push(activity);
    }

    await indexConversations({ project, conversations });

    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
