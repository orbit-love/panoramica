import React from "react";

import Paginator from "src/components/domains/feed/Paginator";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";

// this component transforms a list of activities into the most recent
// activity for each unique conversation
export default function ConversationFeed({
  project,
  activities,
  handlers,
  term,
  pageInfo,
  setFirst,
}) {
  // if multiple activities are in the same conversation, only show
  // the first one that is passed in the array; this allows callers
  // to specify the activity they want shown in the preview
  var conversationIds = activities.map((a) => a.conversation.id);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversation.id) === index;
  });

  return (
    <div className="border-t border-gray-300 dark:border-gray-700">
      <Paginator
        activities={activities}
        setFirst={setFirst}
        pageInfo={pageInfo}
        eachActivity={({ activity, index }) => (
          <ConversationFeedItem
            project={project}
            key={activity.id}
            index={index}
            activity={activity}
            handlers={handlers}
            term={term}
          />
        )}
      />
    </div>
  );
}
