import { prisma } from "src/data/db";
import {
  searchProjectConversations,
  toPageContent,
} from "src/integrations/typesense";

const getSimilarConversations = async ({
  projectId,
  activityId,
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
      filter_by: `body_length:>150 && id:!=${activityId}`,
      limit: 25,
    },
  });

  return documents.map((doc) => ({ id: doc.id, distance: doc.distance }));
};

export default getSimilarConversations;
