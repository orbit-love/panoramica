import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";
import Entity from "components/compact/entity";
import Activity from "components/compact/activity";

export default function Threads({
  community,
  selection,
  setSelection,
  connection,
  setConnection,
  entity,
  setEntity,
}) {
  var threads = community.activities.filter(
    (activity) =>
      !activity.parent &&
      activity.children?.length > 0 &&
      !activity.sourceParentId
  );

  const Thread = (props) => {
    let { activity, nesting } = props;

    return (
      <div
        className={classnames(`flex flex-col space-y-3`, {
          "border-l border-indigo-700": nesting > 0,
          "pl-3": nesting > 0,
        })}
      >
        <Activity {...props} />
        {activity.children.map((id) => {
          var childActivity = community.activities.find((a) => a.id === id);
          return (
            <Thread
              {...props}
              key={childActivity.id}
              activity={childActivity}
              nesting={nesting + 1}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex overflow-scroll flex-col space-y-2 w-full">
      <div className="flex justify-between items-center px-4 pt-4 space-x-1 whitespace-nowrap">
        <span className="text-lg font-bold">Conversations</span>
        <span className="px-1 text-indigo-500">{threads.length}</span>
        <span className="!mx-auto" />
      </div>
      <div className="mx-4 border-b border-indigo-900" />
      {threads.length > 0 && (
        <>
          {threads.map((thread, index) => (
            <div
              key={thread.id}
              className={classnames("flex flex-col space-y-0 px-4 py-2", {
                "bg-indigo-900": index % 2 === 1,
                "bg-opacity-20": index % 2 === 1,
              })}
            >
              <Thread
                activity={thread}
                community={community}
                setConnection={setConnection}
                selection={selection}
                setSelection={setSelection}
                nesting={0}
              />
            </div>
          ))}
          <div className="mx-4 border-b border-indigo-900" />
        </>
      )}
      {threads.length === 0 && (
        <div className="px-4 text-indigo-500">No conversations.</div>
      )}
    </div>
  );
}
