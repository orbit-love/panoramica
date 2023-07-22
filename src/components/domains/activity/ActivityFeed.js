import React from "react";

import Paginated from "src/components/domains/activity/Paginated";
import Expandable from "src/components/domains/conversation/Expandable";

// this component transforms a list of activities into the most recent
// activity for each unique conversation
export default function ActivityFeed({ activities, community, handlers }) {
  // show the most recent message in each conversation
  var conversationIds = activities.map((a) => a.conversationId);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  return (
    <Paginated
      activities={activities}
      community={community}
      eachActivity={({ activity, index }) => (
        <Expandable
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
