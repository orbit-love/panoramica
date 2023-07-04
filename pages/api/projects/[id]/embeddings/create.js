import { check, redirect, authorizeProject } from "lib/auth";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getActivities } from "lib/graph/queries";
import GraphConnection from "lib/graphConnection";

function stripHtmlTags(htmlString) {
  return htmlString.replace(/<[^>]*>/g, "");
}

function truncateDateToDay(isoDatetime) {
  const date = new Date(isoDatetime);
  date.setHours(0, 0, 0, 0); // Truncate time to midnight
  return date.getTime(); // Get the timestamp in milliseconds
}

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
    var namespace = `project-${projectId}`;

    const indexName = process.env.PINECONE_INDEX_NAME;
    const pineconeIndex = pinecone.Index(indexName);
    await pineconeIndex.delete1({
      deleteAll: true,
      namespace,
    });

    const graphConnection = new GraphConnection();

    const from = "0000";
    const to = "9999";
    const activities = await getActivities({
      graphConnection,
      projectId,
      from,
      to,
    });

    const content = (activity) => `
      Author Names: ${activity.globalActorName} ${activity.actorName} ${
      activity.actor
    }
      Source: ${activity.source}
      Channel: ${activity.sourceChannel}
      Text: ${stripHtmlTags(activity.textHtml)}
      Timestamp: ${activity.timestamp}
    `;

    const docs = activities.map(
      (activity) =>
        new Document({
          pageContent: content(activity),
          metadata: {
            activityId: activity.id,
            timestamp: truncateDateToDay(activity.timestamp),
          },
        })
    );

    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex,
      namespace,
    });

    // process the project
    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
