import utils from "src/utils";
import { prisma } from "src/data/db";
import { searchProjectConversations } from "src/integrations/typesense";

const searchConversations = async ({ projectId, query }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  const keywords = utils.findQuotedSubstrings(query);
  let keywordSearch = {};
  if (keywords.length > 0) {
    const filter = keywords.map((keyword) => `\`${keyword}\``).join(",");
    keywordSearch.filter_by = `body: [${filter}]`;
  }

  console.log(keywordSearch);

  const documents = await searchProjectConversations({
    project,
    searchRequest: {
      q: query,
      query_by: "embedding",
      prefix: false,
      limit: 25,
      ...keywordSearch,
    },
  });

  return documents.map((doc) => ({ id: doc.id, distance: doc.distance }));
};

export default searchConversations;
