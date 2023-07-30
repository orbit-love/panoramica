import { Document } from "langchain/document";
import {
  getPineconeIndex,
  prepareVectorStore,
} from "src/integrations/pinecone";

function stripHtmlTags(htmlString) {
  // replace all html tags with a space and then turn all spaces into a single space
  return htmlString.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function truncateDateToDay(isoDatetime) {
  const date = new Date(isoDatetime);
  date.setHours(0, 0, 0, 0); // Truncate time to midnight
  return date.getTime(); // Get the timestamp in milliseconds
}

function embeddedContent(activity) {
  return stripHtmlTags(activity.textHtml);
}

export const deleteEmbeddings = async ({ project }) => {
  var pineconeIndex = await getPineconeIndex({ project });
  var projectId = project.id;
  var namespace = `project-${projectId}`;
  await pineconeIndex.delete1({
    deleteAll: true,
    namespace,
  });
  var namespaceConversations = `project-conversations-${projectId}`;
  await pineconeIndex.delete1({
    deleteAll: true,
    namespace: namespaceConversations,
  });
};

export const createEmbeddings = async ({ project, activities }) => {
  var docs = activities.map((activity) => {
    const pageContent = embeddedContent(activity);
    var doc = new Document({
      pageContent,
      metadata: {
        id: activity.id,
        conversationId: activity.conversationId,
        timestamp: truncateDateToDay(activity.timestamp),
        contentLength: pageContent.length,
      },
    });
    return doc;
  });

  const pineconeStore = await prepareVectorStore({ project });

  // pass in the document ids for upserts to avoid duplicates
  var ids = docs.map(({ metadata }) => metadata.id);
  await pineconeStore.addDocuments(docs, ids);
  console.log(`Uploaded ${docs.length} docs to Pinecone`);
};

export const createConversationEmbeddings = async ({
  project,
  conversations,
}) => {
  const docs = [];
  for (let [conversationId, activities] of Object.entries(conversations)) {
    // reverse the activities so that the oldest is first
    const pageContent = activities.reverse().map(embeddedContent).join(" ");
    // grab the most recent activity for the timestamp
    const lastActivity = activities[0];
    // add the number of activities as a relevance marker
    const activityCount = activities.length;
    // add the source and source channel to the metadata
    const { source, sourceChannel } = lastActivity;
    // add the timestamp of the last activity to the metadata
    const timestamp = truncateDateToDay(lastActivity.timestamp);

    // add a contentLength for query-time filtering
    const contentLength = pageContent.length;

    docs.push({
      pageContent,
      metadata: {
        id: conversationId,
        timestamp,
        activityCount,
        source,
        sourceChannel,
        contentLength,
      },
    });
  }

  const namespace = `project-conversations-${project.id}`;
  const pineconeStore = await prepareVectorStore({ project, namespace });

  // pass in the document ids for upserts to avoid duplicates
  var ids = docs.map(({ metadata }) => metadata.id);
  await pineconeStore.addDocuments(docs, ids);
  console.log(`Uploaded ${docs.length} docs to Pinecone`);
};
