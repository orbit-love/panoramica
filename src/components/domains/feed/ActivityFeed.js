import React from "react";

import Paginator from "src/components/domains/feed/Paginator";
import Conversation from "src/components/domains/feed/Conversation";

// this component transforms a list of activities into the most recent
// activity for each unique conversation
export default function ActivityFeed({ activities, community, handlers }) {
  // show the most recent message in each conversation
  var conversationIds = activities.map((a) => a.conversationId);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  return (
    <Paginator
      activities={activities}
      community={community}
      eachActivity={({ activity, index }) => (
        <Conversation
          key={activity.id}
          index={index}
          activity={activity}
          community={community}
          handlers={handlers}
        />
      )}
    />
  );
}
