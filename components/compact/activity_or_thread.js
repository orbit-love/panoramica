import React, { useState } from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import Thread from "components/compact/thread";

const isThread = (thread) => thread.type === "thread";
const isIsland = (thread) => thread.type === "island";

const TopThread = (props) => {
  const { thread, activity, community, onClickConversation } = props;

  // get the activity for the last activity
  var latestDescendant = community.threads[thread.descendants?.slice(-1)];
  var latestDescendantParent = community.activities.find(
    (a) => a.id === latestDescendant.parent
  );

  // try to show the parent of the last reply if it exists
  // ideally this would not show the other replies though
  var [showAfter, setShowAfter] = useState(
    latestDescendantParent?.timestamp || thread.last_timestamp
  );

  return (
    <div onClick={() => onClickConversation(activity)}>
      <Thread
        nesting={0}
        topThread={thread}
        showAfter={showAfter}
        setShowAfter={setShowAfter}
        {...props}
      />
    </div>
  );
};

// if an activity is a thread starter, render it as a thread
// otherwise just render as a single activity
export default function ActivityOrThread(props) {
  var { activity, community, index, showReplies } = props;

  var thread = community.threads[activity.id];

  return (
    <div
      key={activity.id}
      className={classnames("flex flex-col py-3 px-4", {
        "bg-blue-900": index % 2 === 1,
        "bg-opacity-20": index % 2 === 1,
      })}
    >
      {/* {thread.entities?.length > 0 && (
        <div className="flex flex-wrap justify-end items-center space-x-1">
          {thread.entities?.map((entity) => (
            <button
              className="bg-opacity-40 py-1 px-2 my-1 text-xs bg-fuchsia-900 rounded-lg"
              key={entity}
              onClick={() => onClickEntity({ id: entity })}
            >
              {entity}
            </button>
          ))}
        </div>
      )} */}
      {isThread(thread) && (
        <TopThread
          thread={thread}
          activity={activity}
          community={community}
          showSourceIcon
          {...props}
        />
      )}
      {(isIsland(thread) || showReplies) && (
        <Activity
          activity={activity}
          community={community}
          showSourceIcon
          showSourceChannel
          {...props}
        />
      )}
    </div>
  );
}
