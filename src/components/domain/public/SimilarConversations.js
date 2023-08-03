import React from "react";
import ActivityItem from "src/components/domains/public/ActivityItem";

export default function SimilarConversations({
  project,
  community,
  handlers,
  similarConversations,
}) {
  // filter out and limit the number we show
  var scoreThreshold = 0.8;
  var activities = similarConversations
    .filter(({ score }) => score > scoreThreshold)
    .slice(0, 5)
    .map(({ id }) => community.findActivityById(id));

  return (
    <>
      {activities.map((activity, index) => (
        <ActivityItem
          project={project}
          key={activity.id}
          index={index}
          activity={activity}
          community={community}
          handlers={handlers}
        />
      ))}
    </>
  );
}
