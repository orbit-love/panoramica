import React from "react";
import ActivityOrThread from "components/compact/activity_or_thread";

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
