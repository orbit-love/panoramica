import { check, redirect, authorizeProject } from "lib/auth";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getConversation } from "lib/graph/ai/queries";
import { getActivities } from "lib/graph/queries";
import GraphConnection from "lib/graphConnection";

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

    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_API_ENV,
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX_NAME;
    const pineconeIndex = pinecone.Index(indexName);
    await pineconeIndex.delete1({
      deleteAll: true,
    });

    const graphConnection = new GraphConnection();

    // const conversationId = "cljk3lpko0dwompoifqx7z3jr";
    // const messages = await getConversation({
    //   graphConnection,
    //   projectId,
    //   conversationId,
    // });

    const from = "0000";
    const to = "9999";
    const activities = await getActivities({
      graphConnection,
      projectId,
      from,
      to,
    });

    const content = (activity) => `At ${activity.timestamp}, ${
      activity.globalActorName
    } a.k.a. ${activity.actorName} or ${activity.actor},
    posted this message on a chat forum, given in HTML format:

    ${activity.textHtml}

    The id of this message is ${
      activity.sourceId
    } and the chat application was ${activity.source}. ${
      activity.sourceParentId
        ? `It is a reply to the message with the id ${activity.sourceParentId}.`
        : ""
    }`;

    const docs = activities.map(
      (activity) =>
        new Document({
          pageContent: content(activity),
          metadata: {
            activityId: activity.id,
            projectId,
          },
        })
    );

    // const docs = messages.map(
    //   (message) =>
    //     new Document({
    //       pageContent: JSON.stringify(message),
    //       metadata: {
    //         projectId,
    //         conversationId,
    //       },
    //     })
    // );

    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });

    // process the project
    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
