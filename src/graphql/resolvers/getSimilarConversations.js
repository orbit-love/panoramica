import { prisma } from "src/data/db";
import {
  searchProjectConversations,
  toPageContent,
} from "src/integrations/typesense";

const getSimilarConversations = async ({
  projectId,
  conversationId,
  descendants,
}) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  var q = toPageContent(descendants);

  const documents = await searchProjectConversations({
    project,
    searchRequest: {
      q,
      query_by: "embedding",
      prefix: false,
      // filter_by: `body_length:>150`,
      limit: 25,
    },
  });

  return documents
    .filter(({ id }) => id !== conversationId)
    .map((doc) => ({ id: doc.id, distance: doc.distance }));
};

export default getSimilarConversations;
