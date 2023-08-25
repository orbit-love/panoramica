import Typesense from "typesense";

export const getTypesenseClient = ({ project }) => {
  if (!project.typesenseUrl || !project.typesenseApiKey) return;

  const typesenseUrl = new URL(project.typesenseUrl);

  return new Typesense.Client({
    nodes: [
      {
        host: typesenseUrl.hostname,
        port: typesenseUrl.port,
        protocol: typesenseUrl.protocol,
      },
    ],
    apiKey: project.typesenseApiKey,
    connectionTimeoutSeconds: 2,
  });
};

export const retrieveTypesenseCollection = async ({
  typesenseClient,
  collectionName,
}) => {
  try {
    return await typesenseClient.collections(collectionName).retrieve();
  } catch {
    return;
  }
};

export const findOrCreateTypesenseCollection = async ({
  typesenseClient,
  collectionName,
  schema,
}) => {
  let collection;
  try {
    collection = await typesenseClient.collections(name).retrieve();
  } catch {
    collection = await typesenseClient.collections().create({
      fields: [
        ...schema.fields,
        {
          name: "embedding",
          type: "float[]",
          embed: {
            from: schema.embedding,
            model_config: {
              model_name: `openai/${project.modelName}`,
              api_key: project.modelApiKey,
            },
          },
        },
      ],
      name: collectionName,
    });
  }

  return collection;
};

export const deleteTypesenseCollection = ({ collection }) => {
  collection.delete();
};

export const bulkDeleteTypesenseDocuments = async ({ collection, query }) => {
  if (query) {
    return await collection.documents().delete(query);
  } else {
    return await collection.documents().delete();
  }
};

export const bulkUpsertTypesenseDocuments = async ({
  collection,
  documents,
}) => {
  return await collection.documents().import(documents, { action: "upsert" });
};

export const validateSearches = (searches) => {
  return searches.every((search) => search.collection && search.q);
};
