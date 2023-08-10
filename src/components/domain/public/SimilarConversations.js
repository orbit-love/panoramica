import React from "react";
import ActivityItem from "src/components/domains/public/ActivityItem";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetSimilarConversationsQuery from "./GetSimilarConversations.gql";
import GetActivitiesByIdsQuery from "./GetActivitiesByIds.gql";

export default function SimilarConversations({ project, activity, handlers }) {
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
  const scoreThreshold = 0.8;
  var filteredConversations = similarConversations
    .filter(({ score }) => score > scoreThreshold)
    .slice(0, 5);

  var ids = filteredConversations.map(({ id }) => id);

  const {
    data: {
      projects: [{ activities }],
    },
  } = useSuspenseQuery(GetActivitiesByIdsQuery, {
    variables: { projectId, ids },
  });

  const conversation = activity;
  return (
    <>
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          project={project}
          activity={activity}
          conversation={conversation}
          handlers={handlers}
        />
      ))}
    </>
  );
}
