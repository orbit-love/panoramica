import { check, redirect, authorizeProject, createJWT } from "src/auth";
import { aiReady } from "src/integrations/ready";
import {
  deleteConversationsCollection,
  indexConversations,
} from "src/integrations/typesense";
import { ogm, Project } from "src/models";

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

    // Drop the whole collection (if it exists) so that it's rebuilt with the latest schema
    await deleteConversationsCollection({ project });

    await ogm.init();
    const context = {
      user,
      token: createJWT(user),
    };

    const result = await Project.find({
      where: { id: projectId },
      selectionSet: `
      {
        conversations {
          descendants(options: { sort: { timestamp: ASC } }) {
            id
            source
            sourceChannel
            globalActorName
            textHtml
            timestamp
          }
        }
      }`,
      context,
    });

    const [{ conversations }] = result;

    // in batches of 100, process the conversations
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < conversations.length; i += batchSize) {
      batches.push(conversations.slice(i, i + batchSize));
    }
    for (let batch of batches) {
      // create a map of conversations and activities for
      // conversation-level embeds
      const conversationMap = batch.reduce((acc, conversation) => {
        acc[conversation.id] = conversation.descendants;
        return acc;
      }, {});

      await indexConversations({ project, conversations: conversationMap });
      console.log("Indexed conversation batch - ", batch.length);
    }

    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
