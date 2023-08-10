import { prisma } from "src/data/db";
import { prepareVectorStore } from "src/integrations/pinecone";
import { toPageContent } from "src/integrations/pinecone/embeddings";

const getSimilarConversations = async ({
  projectId,
  activityId,
  descendants,
}) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  var q = toPageContent(descendants);

  var namespace = `project-conversations-${projectId}`;
  const vectorStore = await prepareVectorStore({ project, namespace });

  var vectorDocs = await vectorStore.similaritySearchWithScore(q, 25, {
    contentLength: { $gt: 150 },
  });

  // filter out the match for the conversation itself
  vectorDocs = vectorDocs.filter(([doc, _]) => doc.metadata.id != activityId);

  // get unique conversation ids from the vector docs

  const result = vectorDocs.map(([doc, score]) => ({
    ...doc.metadata,
    score,
  }));

  return result;
};

export default getSimilarConversations;
