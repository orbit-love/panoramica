import React from "react";
import classnames from "classnames";

import Thread from "components/compact/thread";

export default function Threads({
  threads,
  community,
  selection,
  setSelection,
  setConnection,
}) {
  return (
    <div className="flex overflow-x-hidden overflow-y-scroll flex-col space-y-2 w-full">
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
