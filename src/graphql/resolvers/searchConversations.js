import { prisma } from "src/data/db";
import { searchProjectConversations } from "src/integrations/typesense";

const searchConversations = async ({ projectId, query }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  const documents = await searchProjectConversations({
    project,
    searchRequest: {
      q: query,
      query_by: "body,embedding",
      limit: 25,
    },
  });

  return documents.map((doc) => ({ id: doc.id, distance: doc.distance }));
};

export default searchConversations;
