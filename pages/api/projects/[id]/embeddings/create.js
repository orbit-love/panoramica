import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { getActivities } from "src/data/graph/queries";
import GraphConnection from "src/data/graph/Connection";
import {
  createEmbeddings,
  createConversationEmbeddings,
  deleteEmbeddings,
} from "src/integrations/pinecone/embeddings";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
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

    // delete existing embeddings
    await deleteEmbeddings({ project });

    // create embeddings for all activities
    const graphConnection = new GraphConnection();
    const activities = await getActivities({
      graphConnection,
      projectId,
    });

    // create a map of conversations and activities for
    // conversation-level embeds
    const conversations = {};
    activities.forEach((activity) => {
      if (!conversations[activity.conversationId]) {
        conversations[activity.conversationId] = [];
      }
      conversations[activity.conversationId].push(activity);
    });

    // create embeddings for all activities at the same time
    await Promise.all([
      createEmbeddings({ project, activities }),
      createConversationEmbeddings({ project, conversations }),
    ]);

    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
