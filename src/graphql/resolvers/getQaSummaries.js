import { prisma } from "src/data/db";
import { getProjectQAsCollection } from "src/integrations/typesense";

export const getQaSummaries = async ({ projectId }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });
  if (!project) return [];
  const collection = await getProjectQAsCollection({ project });
  if (!collection) return [];

  const results = await collection.$.documents().search({
    q: "*",
    facet_by: ["root_url"],
    // We don't really care about the documents, only the facet counts.
    exclude_fields: "embedding,id,question,answer,page_url,page_title",
    per_page: 1,
  });

  return results.facet_counts.map((facetCount) => {
    const countObject = facetCount.counts[0];

    return {
      rootUrl: countObject.value,
      count: countObject.count,
    };
  });
};
