import React from "react";

import Activities from "src/components/domain/activities";

export default function ActivityFeed({ activities, community, handlers }) {
  // only show the most recent reply in any conversation
  var conversationIds = activities.map((a) => a.conversationId);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  var onClickActivity = (e, activity) => {
    var conversation = community.findActivityById(activity.conversationId);
    handlers.onClickActivity(e, conversation);
  };

  // max depth of 0 prevents threads rendering down, so that
  return (
    <Activities
      activities={activities}
      community={community}
      handlers={{ ...handlers, onClickActivity }}
      maxDepth={0}
    />
  );
}
