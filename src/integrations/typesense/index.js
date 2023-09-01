import {
  getTypesenseClient,
  retrieveTypesenseCollection,
  bulkUpsertTypesenseDocuments,
  findOrCreateTypesenseCollection,
  bulkDeleteTypesenseDocuments,
  deleteTypesenseCollection,
} from "./helpers";
import utils from "src/utils";
import { DEFAULT_CONVERSATIONS_SCHEMA, DEFAULT_QAS_SCHEMA } from "./schemas";

function embeddedActivityContent(activity) {
  return utils.cleanHtmlForEmbedding(activity.textHtml);
}

export const toPageContent = (activities) => {
  return activities.reverse().map(embeddedActivityContent).join(" ");
};

// SEARCH

const getProjectCollection = async ({ project, collectionName }) => {
  const typesenseClient = getTypesenseClient({ project });
  if (!typesenseClient) return;
  return await retrieveTypesenseCollection({
    typesenseClient,
    collectionName,
  });
};

export const getProjectConversationsCollection = async ({ project }) => {
  return await getProjectCollection({
    project,
    collectionName: `project-conversations-${project.id}`,
  });
};

export const getProjectQAsCollection = async ({ project }) => {
  return await getProjectCollection({
    project,
    collectionName: `project-qas-${project.id}`,
  });
};

export const searchProjectConversations = async ({
  project,
  searchRequest,
}) => {
  const collection = await getProjectConversationsCollection({ project });
  if (!collection) return [];

  const searchResult = await collection.$.documents().search(searchRequest);

  console.log(`Conversations search took ${searchResult.search_time_ms} ms`);

  return searchResult.hits.map((hit) => {
    return {
      ...hit.document,
      highlights: hit.highlights,
      // Keyword-match gets a distance of 0, we want to keep it
      distance: hit.highlights.length > 0 ? 0 : hit.vector_distance || 0,
    };
  });
};

// CREATE

export const indexConversations = async ({ project, conversations }) => {
  const typesenseClient = getTypesenseClient({ project });
  if (!typesenseClient) return;

  const documents = [];
  for (let [conversationId, activities] of Object.entries(conversations)) {
    const body = toPageContent(activities);
    // grab the most recent activity for the timestamp
    const lastActivity = activities[0];
    const firstActivity = activities[activities.length - 1];
    // add the source and source channel to the metadata
    const { source, sourceChannel } = lastActivity;
    // add a contentLength for query-time filtering
    const contentLength = body.length;

    const startTimestamp = new Date(firstActivity.timestamp).getTime();
    const endTimestamp = new Date(lastActivity.timestamp).getTime();

    // if no content is left, don't index the doc
    if (contentLength > 0) {
      documents.push({
        id: conversationId,
        body,
        body_length: body.length,
        // Add the actors for use in filters
        actors: activities.map((activity) => activity.globalActorName),
        // add the timestamp of the last activity to the metadata
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp,
        duration: endTimestamp - startTimestamp,
        // add the number of activities as a relevance marker
        activity_count: activities.length,
        source,
        source_channel: sourceChannel,
        // TODO: Also add properties here
      });
    }
  }

  if (documents.length === 0) {
    return;
  }

  const collectionName = `project-conversations-${project.id}`;

  const collection = await findOrCreateTypesenseCollection({
    typesenseClient,
    collectionName,
    modelApiKey: project.modelApiKey,
    schema: DEFAULT_CONVERSATIONS_SCHEMA,
  });

  return await bulkUpsertTypesenseDocuments({ collection, documents });
};

export const indexQAs = async ({ project, qas }) => {
  const typesenseClient = getTypesenseClient({ project });
  if (!typesenseClient) return;

  const collectionName = `project-qas-${project.id}`;

  const collection = await findOrCreateTypesenseCollection({
    typesenseClient,
    collectionName,
    modelApiKey: project.modelApiKey,
    schema: DEFAULT_QAS_SCHEMA,
  });

  const documents = qas.map((qa) => ({
    id: utils.slugify(`${qa.page.url}-${qa.q}`),
    root_url: qa.page.rootUrl,
    question: qa.q,
    answer: qa.a,
    page_url: qa.page.url,
    page_title: qa.page.title,
  }));

  return await bulkUpsertTypesenseDocuments({ collection, documents });
};

// DELETE

export const deleteIndexedQAs = async ({ project, rootUrl }) => {
  const collection = await getProjectQAsCollection({ project });
  if (!collection) return;
  return await bulkDeleteTypesenseDocuments({
    collection,
    query: { filter_by: `root_url:=${rootUrl.trim().replace(/\/$/, "")}` },
  });
};

export const deleteQAsCollection = async ({ project }) => {
  const collection = await getProjectQAsCollection({ project });
  if (!collection) return;
  return await deleteTypesenseCollection({ collection });
};

export const deleteConversationsCollection = async ({ project }) => {
  const collection = await getProjectConversationsCollection({ project });
  if (!collection) return;
  return await deleteTypesenseCollection({ collection });
};
