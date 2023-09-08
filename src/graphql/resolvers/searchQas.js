import utils from "src/utils";
import { prisma } from "src/data/db";
import { searchProjectQas, toFilters } from "src/integrations/typesense";

export const searchQas = async ({ projectId, query, page, sourceName }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  const filters = toFilters(
    {
      question: utils.findQuotedSubstrings(query),
      source_name: sourceName,
    },
    {
      comparators: {
        question: ":",
        source_name: ":=",
      },
    }
  );

  console.log("Search filters", filters);

  const searchResult = await searchProjectQas({
    project,
    searchRequest: {
      q: query?.trim() || "*",
      query_by: "embedding",
      prefix: false,
      facet_by: ["source_name"],
      page: page,
      filter_by: filters,
      exclude_fields: "embedding",
      per_page: 25,
    },
  });

  if (!searchResult) {
    return { qaSummaries: [], qas: [] };
  }

  return {
    qaSummaries: searchResult.facet_counts[0].counts.map((countObject) => ({
      sourceName: countObject.value,
      count: countObject.count,
    })),
    qas: searchResult.hits
      .filter((doc) => {
        return query ? doc.distance <= 0.25 : true;
      })
      .map(utils.snakeToCamelCase),
  };
};
