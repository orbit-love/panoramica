import React from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetSimilarConversationsQuery from "./GetSimilarConversations.gql";
import GetActivitiesByIdsQuery from "src/components/domains/search/GetActivitiesByIds.gql";

export default function SimilarConversations({
  project,
  activity,
  renderResults,
  distanceThreshold = 0.25,
  maxResults = 5,
}) {
  const { id: projectId } = project;
  const { id: activityId } = activity;

  const {
    data: {
      projects: [
        {
          activities: [{ similarConversations }],
        },
      ],
    },
  } = useSuspenseQuery(GetSimilarConversationsQuery, {
    variables: { projectId, activityId },
  });

  // filter out and limit the number we show
  var filteredConversations = similarConversations
    .filter(({ distance }) => distance <= distanceThreshold)
    .slice(0, maxResults);

  var ids = filteredConversations.map(({ id }) => id);

  const {
    data: {
      projects: [{ activities }],
    },
  } = useSuspenseQuery(GetActivitiesByIdsQuery, {
    variables: { projectId, ids },
  });

  return <>{activities.length > 0 && renderResults({ activities })}</>;
}
