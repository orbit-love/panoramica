import React from "react";
import ActivityOrThread from "components/compact/activity_or_thread";

export default function Activities({
  title,
  community,
  activities,
  remove,
  ...props
}) {
  return (
    <>
      {activities?.length > 0 && (
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
    </>
  );
}
