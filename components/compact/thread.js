import React, { useEffect, useState } from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";

export default function Thread(props) {
  let {
    thread,
    topThread,
    community,
    activity,
    nesting,
    showAfter,
    setShowAfter,
    lastChild,
  } = props;

  // if the child activity is missing, it's because it didn't get
  // brought back in the time slice, so just skip it
  var childActivities = thread.children
    ?.map((id) => community.activities.find((a) => a.id === id))
    .filter((a) => a);

  return (
    <>
      <div
        className={classnames("flex flex-col pt-1", {
          "border-l border-indigo-700": nesting > 0,
          "pl-3": nesting > 0,
        })}
      >
        {/* {parent?.timestamp < showAfter && lastChild && (
          <button
            onClick={() => {
              setShowAfter(parent.timestamp);
            }}
          >
            Expand
          </button>
        )} */}
        <div
          className={classnames("pb-1", {
            hidden: false,
          })}
        >
          <Activity {...props} />
        </div>
        {childActivities?.map((childActivity, index) => {
          var { id } = childActivity;
          var childThread = community.threads[id];
          return (
            <Thread
              {...props}
              key={id}
              activity={childActivity}
              thread={childThread}
              showAfter={showAfter}
              setShowAfter={setShowAfter}
              topThread={topThread}
              community={community}
              nesting={nesting + 1}
              lastChild={index === childActivities.length - 1}
            />
          );
        })}
      </div>
    </>
  );
}
