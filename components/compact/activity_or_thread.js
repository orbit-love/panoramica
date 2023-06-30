import React, { useState } from "react";
import classnames from "classnames";
import c from "lib/common";

import Activity from "components/compact/activity";
import Thread from "components/compact/thread";
import SourceIcon from "components/compact/source_icon";

const isThread = (thread) => thread.type === "thread";
const isIsland = (thread) => thread.type === "island";

const TopThread = ({
  thread,
  activity,
  community,
  onClickChannel,
  ...props
}) => {
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
    <>
      {activity.sourceChannel && (
        <div className="flex justify-end items-center space-x-1 text-xs text-indigo-700">
          <SourceIcon activity={activity} />
          <button onClick={onClickChannel}>
            {c.displayChannel(activity.sourceChannel)}
          </button>
        </div>
      )}
      <Thread
        thread={thread}
        topThread={thread}
        activity={activity}
        nesting={0}
        showAfter={showAfter}
        setShowAfter={setShowAfter}
        community={community}
        {...props}
      />
    </>
  );
};

// if an activity is a thread starter, render it as a thread
// otherwise just render as a single activity
export default function ActivityOrThread({
  activity,
  community,
  index,
  showReplies,
  ...props
}) {
  var thread = community.threads[activity.id];

  return (
    <div
      key={activity.id}
      className={classnames("flex flex-col py-2 px-4", {
        "bg-blue-900": index % 2 === 1,
        "bg-opacity-20": index % 2 === 1,
      })}
    >
      {isThread(thread) && (
        <TopThread
          thread={thread}
          activity={activity}
          community={community}
          {...props}
        />
      )}
      {(isIsland(thread) || showReplies) && (
        <Activity
          activity={activity}
          community={community}
          showSourceIcon
          {...props}
        />
      )}
    </div>
  );
}
