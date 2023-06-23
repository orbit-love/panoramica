import React from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import Thread from "components/compact/thread";

const isThread = (thread) => thread.type === "thread";
const isIsland = (thread) => thread.type === "island";

// if an activity is a thread starter, render it as a thread
// otherwise just render as a single activity
export default function ActivityOrThread({
  activity,
  community,
  index,
  ...props
}) {
  var thread = community.threads[activity.id];

  return (
    <div
      key={activity.id}
      className={classnames("flex flex-col pt-1 pb-2 px-4", {
        "bg-blue-900": index % 2 === 1,
        "bg-opacity-20": index % 2 === 1,
      })}
    >
      {isThread(thread) && (
        <Thread
          activity={activity}
          community={community}
          thread={thread}
          nesting={0}
          {...props}
        />
      )}
      {isIsland(thread) && (
        <Activity activity={activity} community={community} {...props} />
      )}
    </div>
  );
}
