import React from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import Thread from "components/compact/thread";

const isThread = (activity) =>
  !activity.parent && activity.children?.length > 0 && !activity.sourceParentId;

const isReply = (activity) => Boolean(activity.parent);

const isIsland = (activity) =>
  !activity.parent && activity.children?.length === 0;

// if an activity is a thread starter, render it as a thread
// otherwise just render as a single activity
const ActivityOrThread = ({ activity, index, ...props }) => {
  return (
    <div
      key={activity.id}
      className={classnames("flex flex-col space-y-0 px-4 py-2", {
        "bg-indigo-900": index % 2 === 1,
        "bg-opacity-60": index % 2 === 1,
      })}
    >
      {isThread(activity) && (
        <Thread activity={activity} nesting={0} {...props} />
      )}
      {!isThread(activity) && <Activity activity={activity} {...props} />}
    </div>
  );
};

export default function Feed(props) {
  let { activities } = props;

  // filter out replies which do not get put top-level in the feed
  activities = activities.filter((activity) => !isReply(activity));

  // only show the first 100 for performance reasons
  activities = activities.slice(0, 100);

  return (
    <div className="flex overflow-x-hidden overflow-y-scroll flex-col space-y-2 w-full">
      {activities.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <ActivityOrThread
              key={activity.id}
              activity={activity}
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
