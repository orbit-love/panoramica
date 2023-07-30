import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const getPineconeIndex = async ({ project }) => {
  const { pineconeApiEnv, pineconeApiKey, pineconeIndexName } = project;
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: pineconeApiEnv,
    apiKey: pineconeApiKey,
  });
  return pinecone.Index(pineconeIndexName);
};

export const prepareVectorStore = async ({ project, namespace }) => {
  const pineconeIndex = await getPineconeIndex({ project });
  var namespace = namespace || `project-${project.id}`;

  return await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: project.modelApiKey,
    }),
    { pineconeIndex, namespace }
  );
};
