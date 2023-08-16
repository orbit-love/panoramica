import React from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetPinsQuery from "src/graphql/queries/GetPins.gql";
import ActivityItem from "src/components/domains/welcome/ActivityItem";

export default function PinnedConversations({ project, handlers }) {
  const { id: projectId } = project;
  const {
    data: {
      projects: [
        {
          pinsConnection: { edges },
        },
      ],
    },
  } = useSuspenseQuery(GetPinsQuery, {
    variables: { projectId },
  });

  // not sure why this filter is needed
  const activities = edges
    .map((edge) => edge.node)
    .filter((activity) => activity.conversation);

  return (
    <div className="flex flex-col space-y-6">
      {activities.map((activity) => (
        <ActivityItem
          key={activity.id}
          project={project}
          activity={activity}
          handlers={handlers}
        />
      ))}
    </div>
  );
}
