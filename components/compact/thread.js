import React from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";

export default function Thread(props) {
  let { thread, community, nesting } = props;

  return (
    <div
      className={classnames("flex flex-col", {
        "border-l border-indigo-700": nesting > 0,
        "pl-3": nesting > 0,
      })}
    >
      <div className="py-2">
        <Activity {...props} />
      </div>
      {thread.children?.map((id) => {
        // if the child activity is missing, it's because it didn't get
        // brought back in the time slice, so just skip it
        var childActivity = community.activities.find((a) => a.id === id);
        var childThread = community.threads[id];
        if (childActivity) {
          return (
            <Thread
              {...props}
              key={id}
              activity={childActivity}
              thread={childThread}
              community={community}
              nesting={nesting + 1}
            />
          );
        }
      })}
    </div>
  );
}
