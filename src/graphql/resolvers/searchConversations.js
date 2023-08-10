import { prisma } from "src/data/db";
import { prepareVectorStore } from "src/integrations/pinecone";

const searchConversations = async ({ projectId, query }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  var namespace = `project-${projectId}`;
  const vectorStore = await prepareVectorStore({ project, namespace });

  var vectorDocs = await vectorStore.similaritySearchWithScore(query, 25, {
    contentLength: { $gt: 150 },
  });

  const result = vectorDocs.map(([doc, score]) => ({
    ...doc.metadata,
    score,
  }));

  return result;
};

export default searchConversations;
