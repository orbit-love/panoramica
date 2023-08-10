import React from "react";

import Paginator from "src/components/domains/feed/Paginator";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";

// this component transforms a list of activities into the most recent
// activity for each unique conversation
export default function ConversationFeed({
  project,
  activities,
  community,
  handlers,
  minimal,
  term,
}) {
  // if multiple activities are in the same conversation, only show
  // the first one that is passed in the array; this allows callers
  // to specific the activity they want shown in the preview
  var conversationIds = activities.map((a) => a.conversationId);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  return (
    <div className="border-t border-gray-300 dark:border-gray-700">
      <Paginator
        activities={activities}
        community={community}
        eachActivity={({ activity, index }) => (
          <ConversationFeedItem
            project={project}
            key={activity.id}
            index={index}
            activity={activity}
            community={community}
            handlers={handlers}
            minimal={minimal}
            term={term}
          />
        )}
      />
    </div>
  );
}
