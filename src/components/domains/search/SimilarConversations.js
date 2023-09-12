import React from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetSimilarConversationsQuery from "./GetSimilarConversations.gql";
import GetConversationsByIdsQuery from "src/graphql/queries/GetConversationsByIds.gql";

export default function SimilarConversations({
  project,
  conversation,
  renderResults,
  distanceThreshold = 0.5,
  maxResults = 5,
}) {
  const { id: projectId } = project;
  const { id: conversationId } = conversation;

  const {
    data: {
      projects: [
        {
          conversations: [{ similarConversations }],
        },
      ],
    },
  } = useSuspenseQuery(GetSimilarConversationsQuery, {
    variables: { projectId, conversationId },
  });

  // filter out and limit the number we show
  var filteredConversations = similarConversations
    .filter(({ distance }) => distance <= distanceThreshold)
    .slice(0, maxResults);

  var ids = filteredConversations.map(({ id }) => id);

  const {
    data: {
      projects: [{ conversations }],
    },
  } = useSuspenseQuery(GetConversationsByIdsQuery, {
    variables: { projectId, ids },
  });

  return <>{conversations.length > 0 && renderResults({ conversations })}</>;
}
