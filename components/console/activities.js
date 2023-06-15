import React from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";

export default function Activities({
  activities,
  community,
  selection,
  setSelection,
  setConnection,
}) {
  return (
    <div className="flex overflow-x-hidden overflow-y-scroll flex-col space-y-2 w-full">
      {activities.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={classnames("flex flex-col space-y-0 px-4 py-2", {
                "bg-indigo-900": index % 2 === 1,
                "bg-opacity-20": index % 2 === 1,
              })}
            >
              <Activity
                activity={activity}
                community={community}
                setConnection={setConnection}
                selection={selection}
                setSelection={setSelection}
              />
            </div>
          ))}
          <div className="mx-4 border-b border-indigo-900" />
        </>
      )}
      {activities.length === 0 && (
        <div className="px-4 py-4 text-indigo-500">No activities.</div>
      )}
    </div>
  );
}
