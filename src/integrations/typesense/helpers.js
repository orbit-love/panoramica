import Typesense from "typesense";

export const getTypesenseClient = ({ project }) => {
  if (!project.typesenseUrl || !project.typesenseApiKey) return;

  const typesenseUrl = new URL(project.typesenseUrl);

  return new Typesense.Client({
    nodes: [
      {
        host: typesenseUrl.hostname,
        port: typesenseUrl.port,
        protocol: typesenseUrl.protocol.replace(/\:$/, ""),
      },
    ],
    apiKey: project.typesenseApiKey,
    connectionTimeoutSeconds: 5,
  });
};

export const retrieveTypesenseCollection = async ({
  typesenseClient,
  collectionName,
}) => {
  try {
    const $ = typesenseClient.collections(collectionName);
    const collection = await $.retrieve();
    collection.$ = $;
    return collection;
  } catch {
    return;
  }
};

export const findOrCreateTypesenseCollection = async ({
  typesenseClient,
  collectionName,
  schema,
  modelApiKey,
  modelName = "text-embedding-ada-002",
  addEmbedding = true,
}) => {
  let collection;
  try {
    collection = await typesenseClient.collections(collectionName).retrieve();
  } catch (e) {
    const { fields, embedding, ...other } = schema;
    const structure = {
      name: collectionName,
      fields: [
        ...(addEmbedding
          ? [
              {
                name: "embedding",
                type: "float[]",
                embed: {
                  from: embedding,
                  model_config: {
                    model_name: `openai/${modelName}`,
                    api_key: modelApiKey,
                  },
                },
              },
            ]
          : []),
      ].concat(fields),
      ...other,
    };
    collection = await typesenseClient.collections().create(structure);
  }

  collection.$ = typesenseClient.collections(collectionName);

  return collection;
};

export const deleteTypesenseCollection = async ({ collection }) => {
  return await collection.$.delete();
};

export const bulkDeleteTypesenseDocuments = async ({ collection, query }) => {
  if (query) {
    return await collection.$.documents().delete(query);
  } else {
    console.log(collection);
    return await collection.$.documents().delete();
  }
};

export const bulkUpsertTypesenseDocuments = async ({
  collection,
  documents,
}) => {
  return await collection.$.documents().import(documents, { action: "upsert" });
};

export const validateSearches = (searches) => {
  return searches.every((search) => search.collection && search.q);
};
