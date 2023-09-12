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

export const toFilters = (object, options = {}) => {
  const comparators = options.comparators || {};
  const clause = options.clause || "&&";
  const filters = Object.entries(object)
    .filter((entry) =>
      // Only use defined and non-empty values
      Array.isArray(entry[1]) ? entry[1].length > 0 : entry[1]
    )
    .map((entry) => {
      const comparator = comparators[entry[0]] || ":=";
      const value = Array.isArray(entry[1])
        ? `[${entry[1].map((keyword) => `\`${keyword}\``).join(",")}]`
        : entry[1];
      return `${entry[0]}${comparator} ${value}`;
    })
    .join(` ${clause} `);

  return filters ? filters : undefined;
};

// send in activities in ascending timestamp order
export const toPageContent = (activities) => {
  return activities.map(embeddedActivityContent).join(" ");
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

export const searchProjectQas = async ({ project, searchRequest }) => {
  const collection = await getProjectQAsCollection({ project });
  if (!collection) return;

  const searchResult = await collection.$.documents().search(searchRequest);

  console.log(`Qas search took ${searchResult.search_time_ms} ms`);

  searchResult.hits = searchResult.hits.map((hit) => {
    return {
      ...hit.document,
      distance: hit.vector_distance || 0,
    };
  });

  return searchResult;
};

// CREATE

export const indexConversations = async ({ project, conversations }) => {
  const typesenseClient = getTypesenseClient({ project });
  if (!typesenseClient) return;

  const documents = [];
  for (let [conversationId, activities] of Object.entries(conversations)) {
    const body = toPageContent(activities);

    if (activities.length === 0) {
      // this should not happen but there may be conversations that are
      // created and not cleaned up in the new path - tbd
      console.log("No activities for conversation ", conversationId);
      continue;
    }
    // grab the most recent activity for the timestamp
    const firstActivity = activities[0];
    const lastActivity = activities[activities.length - 1];
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

export const findOrCreateProjectQasCollection = async ({ project }) => {
  const typesenseClient = getTypesenseClient({ project });
  if (!typesenseClient) return;

  const collectionName = `project-qas-${project.id}`;

  const collection = await findOrCreateTypesenseCollection({
    typesenseClient,
    collectionName,
    modelApiKey: project.modelApiKey,
    schema: DEFAULT_QAS_SCHEMA,
  });

  return collection;
};

export const indexQAs = async ({ project, qas }) => {
  const collection = await findOrCreateProjectQasCollection({ project });
  if (!collection) return;

  const documents = qas.map((qa) => ({
    id: utils.slugify(
      [qa.source_name, qa.reference_id || qa.reference_url, qa.question]
        .filter((el) => el)
        .join("-")
    ),
    reference_timestamp: new Date().getTime(),
    ...qa,
  }));

  return await bulkUpsertTypesenseDocuments({ collection, documents });
};

// DELETE

export const deleteIndexedQAs = async ({ project, facets }) => {
  const collection = await getProjectQAsCollection({ project });
  if (!collection) return;
  return await bulkDeleteTypesenseDocuments({
    collection,
    query: { filter_by: toFilters(facets) },
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
