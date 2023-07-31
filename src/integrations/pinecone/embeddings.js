import { Document } from "langchain/document";
import {
  getPineconeIndex,
  prepareVectorStore,
} from "src/integrations/pinecone";
import utils from "src/utils";

function embeddedContent(activity) {
  var str = utils.stripHtmlTags(activity.textHtml);
  str = utils.stripMentions(str);
  str = utils.stripLinks(str);
  str = utils.stripEmojis(str);
  str = utils.stripPunctuation(str);
  return str.replace(/\s+/g, " ").trim();
}

export const toPageContent = (activities) => {
  return activities.map(embeddedContent).join(" ");
};

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
        timestamp: utils.truncateDateToDay(activity.timestamp),
        contentLength: pageContent.length,
      },
    });
    return doc;
  });

  // filter out any docs that are empty
  docs = docs.filter(({ pageContent }) => pageContent?.length > 0);

  // pass in the document ids for upserts to avoid duplicates
  var ids = docs.map(({ metadata }) => metadata.id);

  const pineconeStore = await prepareVectorStore({ project });
  await pineconeStore.addDocuments(docs, ids);
  console.log(`Uploaded ${docs.length} docs to Pinecone`);
};

// conversations is a map of conversation ids and activities
// activities should be sorted in chronologically ascending order
export const createConversationEmbeddings = async ({
  project,
  conversations,
}) => {
  const docs = [];
  for (let [conversationId, activities] of Object.entries(conversations)) {
    // create the pageContent for the activities
    const pageContent = toPageContent(activities);
    // grab the most recent activity for the timestamp
    const lastActivity = activities[0];
    // add the number of activities as a relevance marker
    const activityCount = activities.length;
    // add the source and source channel to the metadata
    const { source, sourceChannel } = lastActivity;
    // add the timestamp of the last activity to the metadata
    const timestamp = utils.truncateDateToDay(lastActivity.timestamp);
    // add a contentLength for query-time filtering
    const contentLength = pageContent.length;

    // if no content is left, don't index the doc
    if (contentLength > 0) {
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
  }

  const namespace = `project-conversations-${project.id}`;
  const pineconeStore = await prepareVectorStore({ project, namespace });

  // pass in the document ids for upserts to avoid duplicates
  var ids = docs.map(({ metadata }) => metadata.id);
  await pineconeStore.addDocuments(docs, ids);
  console.log(`Uploaded ${docs.length} docs to Pinecone`);
};
