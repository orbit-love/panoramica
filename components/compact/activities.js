import React from "react";
import classnames from "classnames";

import Thread from "components/compact/thread";

export default function Activities(props) {
  const { activities, community, handlers, hideNoActivities, maxDepth } = props;
  const { onClickActivity } = handlers;
  return (
    <>
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          onClick={(e) => onClickActivity(e, activity)}
          className={classnames("flex flex-col py-3 px-4 cursor-pointer", {
            "bg-indigo-800 bg-opacity-20 hover:bg-indigo-800 hover:bg-opacity-50":
              index % 2 === 0,
            "bg-blue-900 bg-opacity-20 hover:bg-opacity-30": index % 2 === 1,
          })}
        >
          <Thread
            key={activity.id}
            activity={activity}
            community={community}
            maxDepth={maxDepth}
            handlers={handlers}
          />
        </div>
      ))}
      {!hideNoActivities && activities.length === 0 && (
        <div className="px-4 text-indigo-700 w-[450px]">No activities.</div>
      )}
    </>
  );
}
