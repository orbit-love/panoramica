import React from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";

export default function Thread(props) {
  let { activity, community, nesting } = props;

  return (
    <div
      className={classnames(`flex flex-col space-y-3`, {
        "border-l border-indigo-700": nesting > 0,
        "pl-3": nesting > 0,
      })}
    >
      <Activity {...props} />
      {activity.children.map((id) => {
        // if the child activity is missing, it's because it didn't get
        // brought back in the time slice, so just skip it
        var childActivity = community.activities.find((a) => a.id === id);
        if (childActivity) {
          return (
            <Thread
              {...props}
              key={childActivity.id}
              activity={childActivity}
              nesting={nesting + 1}
            />
          );
        }
      })}
    </div>
  );
}
