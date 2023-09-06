import utils from "src/utils";
import { prisma } from "src/data/db";
import { getTypesenseClient } from "src/integrations/typesense/helpers";
import {
  getProjectConversationsCollection,
  getProjectQAsCollection,
} from "src/integrations/typesense";

const performOmniSearch = async ({ projectId, query }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  const keywords = utils.findQuotedSubstrings(query);
  let filter;
  if (keywords.length > 0) {
    filter = keywords.map((keyword) => `\`${keyword}\``).join(",");
    filter = `[${filter}]`;
  }

  const typesenseClient = getTypesenseClient({ project });
  const conversationsCollection = await getProjectConversationsCollection({
    project,
    typesenseClient,
  });
  const qasCollection = await getProjectQAsCollection({
    project,
    typesenseClient,
  });

  // Not using directly typesenseClient.multiSearch because
  // it was slower for some reason
  const customMultiSearchResult = await Promise.all([
    conversationsCollection
      ? conversationsCollection.$.documents().search({
          collection: `project-conversations-${projectId}`,
          q: query,
          query_by: "embedding",
          exclude_fields: "embedding",
          prefix: false,
          filter_by: filter ? `body: ${filter}` : undefined,
          limit: 10,
        })
      : null,
    qasCollection
      ? qasCollection.$.documents().search({
          collection: `project-qas-${projectId}`,
          q: query,
          query_by: "embedding",
          exclude_fields: "embedding",
          prefix: false,
          filter_by: filter
            ? `question: ${filter} || answer: ${filter}`
            : undefined,
          limit: 10,
        })
      : null,
  ]);

  const belowThreshold = (hit) =>
    !hit.vector_distance || hit.vector_distance <= 0.25;

  const conversationHits = customMultiSearchResult[0]
    ? customMultiSearchResult[0].hits.filter(belowThreshold)
    : [];

  const qaHits = customMultiSearchResult[0]
    ? customMultiSearchResult[1].hits.filter(belowThreshold)
    : [];

  return {
    conversationSearchResults: conversationHits.map((hit) => ({
      id: hit.document.id,
      distance: hit.vector_distance,
    })),
    qaSearchResults: qaHits.map((hit) => ({
      id: hit.document.id,
      distance: hit.vector_distance,
      pageUrl: hit.document.page_url,
      pageTitle: hit.document.page_title,
      question: hit.document.question,
      answer: hit.document.answer,
    })),
  };
};

export default performOmniSearch;
