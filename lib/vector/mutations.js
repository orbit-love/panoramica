import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

function stripHtmlTags(htmlString) {
  return htmlString.replace(/<[^>]*>/g, "");
}

function truncateDateToDay(isoDatetime) {
  const date = new Date(isoDatetime);
  date.setHours(0, 0, 0, 0); // Truncate time to midnight
  return date.getTime(); // Get the timestamp in milliseconds
}

const getPineconeIndex = async ({ project }) => {
  const { pineconeApiEnv, pineconeApiKey, pineconeIndexName } = project;
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: pineconeApiEnv,
    apiKey: pineconeApiKey,
  });
  return pinecone.Index(pineconeIndexName);
};

export const deleteEmbeddings = async ({ project }) => {
  var pineconeIndex = await getPineconeIndex({ project });
  var projectId = project.id;
  var namespace = `project-${projectId}`;
  await pineconeIndex.delete1({
    deleteAll: true,
    namespace,
  });
};

export const createEmbeddings = async ({ project, activities }) => {
  var projectId = project.id;
  var namespace = `project-${projectId}`;
  var pineconeIndex = await getPineconeIndex({ project });

  const content = (activity) => `
      ${activity.globalActorName} ${activity.actorName} ${activity.actor}
      ${activity.source} ${activity.sourceChannel}
      ${stripHtmlTags(activity.textHtml)}
    `;

  const docs = activities.map(
    (activity) =>
      new Document({
        pageContent: content(activity),
        metadata: {
          activityId: activity.id,
          conversationId: activity.conversationId,
          timestamp: truncateDateToDay(activity.timestamp),
        },
      })
  );

  return PineconeStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ openAIApiKey: project.modelApiKey }),
    {
      pineconeIndex,
      namespace,
    }
  );
};
