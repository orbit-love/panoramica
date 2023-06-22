import React from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import Thread from "components/compact/thread";

const isThread = (thread) => thread.type === "thread";
const isIsland = (thread) => thread.type === "island";

// if an activity is a thread starter, render it as a thread
// otherwise just render as a single activity
const ActivityOrThread = ({ activity, community, index, ...props }) => {
  var thread = community.threads[activity.id];

  return (
    <div
      key={activity.id}
      className={classnames("flex flex-col pt-1 pb-2 px-4", {
        "bg-indigo-900": index % 2 === 1,
        "bg-opacity-60": index % 2 === 1,
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
};

export default function Feed(props) {
  let { activities, community } = props;

  // only show the first 100 for performance reasons
  activities = activities.slice(0, 100);

  return (
    <div className="flex overflow-x-hidden overflow-y-scroll h-[calc(40vh-59px)] flex-col space-y-2 w-full">
      {activities.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <ActivityOrThread
              key={activity.id}
              activity={activity}
              community={community}
              index={index}
              {...props}
            />
          ))}
        </>
      )}
      {activities.length === 0 && (
        <div className="px-4 py-4 text-indigo-500">No activity.</div>
      )}
    </div>
  );
}
