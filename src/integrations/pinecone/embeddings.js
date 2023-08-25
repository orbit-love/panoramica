import { Document } from "langchain/document";
import {
  getPineconeIndex,
  prepareVectorStore,
} from "src/integrations/pinecone";
import utils from "src/utils";
import TurndownService from "turndown";

function embeddedActivityContent(activity) {
  return utils.cleanHtmlForEmbedding(activity.textHtml);
}

export const toPageContent = (activities) => {
  return activities.map(embeddedActivityContent).join(" ");
};

const deleteEmbedding = async ({ pineconeIndex, namespace }) => {
  await pineconeIndex.delete1({
    deleteAll: true,
    namespace,
  });
};

export const deleteEmbeddings = async ({ project }) => {
  const projectId = project.id;
  var pineconeIndex = await getPineconeIndex({ project });
  await deleteEmbedding({ pineconeIndex, namespace: `project-${projectId}` });
  await deleteEmbedding({
    pineconeIndex,
    namespace: `project-conversations-${projectId}`,
  });
  await deleteEmbedding({
    pineconeIndex,
    namespace: `project-documentation-${projectId}`,
  });
};

export const createEmbeddings = async ({ project, activities }) => {
  var docs = activities.map((activity) => {
    const pageContent = embeddedActivityContent(activity);
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

// conversations is a map of conversation ids and activities
// activities should be sorted in chronologically ascending order
export const createDocumentationEmbeddings = async ({ project, pages }) => {
  const docs = [];
  const turndownService = new TurndownService({ headingStyle: "atx" });

  for (let page of pages) {
    if (!page.url) continue;
    const id = page.url.trim().replace(/\/$/, "");
    // create the pageContent for the docs based on the headings
    const pageContent = page.headings
      .map(utils.cleanHtmlForEmbedding)
      .join("\n");
    // add a contentLength for query-time filtering
    const contentLength = pageContent.length;
    // Time at which the documentation was indexed. Too old could mean outdated
    const timestamp = utils.truncateDateToDay(Date.now());

    // if no content is left, don't index the doc
    if (contentLength > 0) {
      docs.push({
        pageContent,
        metadata: {
          id,
          title: page.title,
          // Keeping the markdown body so that it can be used as context for the LLM
          // The context would then be richer with links, headings and more
          // TODO: Also summarize with AI
          body: turndownService.turndown(page.body),
          contentLength,
          timestamp,
        },
      });
    }
  }

  const namespace = `project-documentation-${project.id}`;
  const pineconeStore = await prepareVectorStore({ project, namespace });

  // pass in the document ids for upserts to avoid duplicates
  var ids = docs.map(({ metadata }) => metadata.id);
  await pineconeStore.addDocuments(docs, ids);
  console.log(`Uploaded ${docs.length} documentation pages to Pinecone`);
};

export const deleteDocumentationEmbeddings = async ({ project }) => {
  var pineconeIndex = await getPineconeIndex({ project });
  await deleteEmbedding({
    pineconeIndex,
    namespace: `project-documentation-${project.id}`,
  });
};
