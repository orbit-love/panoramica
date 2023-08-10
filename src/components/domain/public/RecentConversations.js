import React from "react";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import GetRecentConversationsQuery from "./GetRecentConversations.gql";
import ActivityItem from "src/components/domains/public/ActivityItem";

export default function RecentConversations({ project, handlers }) {
  const { id: projectId } = project;
  const query = GetRecentConversationsQuery;
  const variables = {
    projectId,
    minDescendants: 5,
  };

  const eachActivity = ({ activity }) => (
    <ActivityItem
      key={activity.id}
      project={project}
      activity={activity}
      handlers={handlers}
    />
  );

  return (
    <ConversationFeed
      className="flex flex-col px-6 mb-12 space-y-6"
      eachActivity={eachActivity}
      query={query}
      variables={variables}
      handlers={handlers}
    />
  );
}
