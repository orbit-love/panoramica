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
}) {
  return (
    <div className="flex">
      <div className="max-w-xl border-t border-gray-300 dark:border-gray-700">
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
            />
          )}
        />
      </div>
      <div className="dark:bg-gray-950 flex-1 bg-gray-300 border-l border-gray-200 dark:border-gray-800"></div>
    </div>
  );
}
