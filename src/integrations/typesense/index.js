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

const toDocument = ({ conversation }) => {
  const activities = conversation.descendants;

  // create a string of each activity that can be snippeted to the
  // end user; we will do some post-processing on the display side
  // so that it looks good
  var text = "";
  for (const activity of activities) {
    text += utils.stripHtmlTags(activity.textHtml);
    text += "\n\n";
  }
  const textLength = text.length;

  if (textLength === 0) {
    return null;
  }

  const {
    id,
    source,
    sourceChannel,
    firstActivityTimestamp,
    lastActivityTimestamp,
    firstActivityTimestampInt,
    lastActivityTimestampInt,
    memberCount,
    activityCount,
    properties,
  } = conversation;

  const duration = lastActivityTimestampInt - firstActivityTimestampInt;
  const actors = conversation.members.map((member) => member.globalActorName);

  // turn the properties into one field each; when there are multiple properties
  // with the same name, e.g. tags, those become a single array
  var propertiesToIndex = {};
  for (const { name, value } of properties) {
    const existing = propertiesToIndex[name];
    if (!existing) {
      propertiesToIndex[name] = value;
    } else if (Array.isArray(existing)) {
      propertiesToIndex[name] = [...existing, value];
    } else {
      propertiesToIndex[name] = [existing, value];
    }
  }

  // add "properties." to the name to the name of each property
  propertiesToIndex = Object.fromEntries(
    Object.entries(propertiesToIndex).map(([name, value]) => [
      `properties.${name}`,
      value,
    ])
  );

  const viewObject = JSON.stringify(conversation);

  return {
    id,
    text,
    textLength,
    actors,
    source,
    sourceChannel,
    firstActivityTimestamp,
    firstActivityTimestampInt,
    lastActivityTimestamp,
    lastActivityTimestampInt,
    duration,
    activityCount,
    memberCount,
    viewObject,
    ...propertiesToIndex,
  };
};

export const indexConversations = async ({ project, conversations }) => {
  const typesenseClient = getTypesenseClient({ project });
  if (!typesenseClient) return;

  const documents = [];
  for (let conversation of conversations) {
    const document = toDocument({ conversation });
    if (document) {
      documents.push(document);
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
    addEmbedding: false,
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
