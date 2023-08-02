import React from "react";
import Paginator from "src/components/domains/feed/Paginator";
import ActivityItem from "src/components/domains/public/ActivityItem";

export default function ConversationFeed({
  project,
  activities,
  community,
  term,
  limit = 25,
}) {
  const onClickTimestamp = (activity) =>
    `/projects/${project.id}/${activity.conversationId}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
    onClickTimestamp,
  };

  return (
    <Paginator
      activities={activities.slice(0, limit)}
      community={community}
      eachActivity={({ activity, index }) => (
        <ActivityItem
          project={project}
          key={activity.id}
          index={index}
          activity={activity}
          community={community}
          handlers={handlers}
          term={term}
        />
      )}
    />
  );
}
