import React, { useState } from "react";
import classnames from "classnames";
import c from "lib/common";

import Activity from "components/compact/activity";
import Thread from "components/compact/thread";
import SourceIcon from "components/compact/source_icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const isThread = (thread) => thread.type === "thread";
const isIsland = (thread) => thread.type === "island";

const TopThread = (props) => {
  const { thread, activity, community, onClickChannel, project } = props;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  var onClickSummary = async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/${activity.id}/summary`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          alert(message);
        } else {
          setSummary(result);
        }
        setLoading(false);
      });
  };

  var { source, sourceChannel } = activity;
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
      <div className="flex justify-end items-center space-x-1 w-full text-xs text-indigo-700">
        {/* {loading && <div className="text-blue-400">Summarizing...</div>} */}
        {/* <div className="pr-2">
          <button onClick={onClickSummary}>
            <FontAwesomeIcon icon="note" className="text-blue-400" />
          </button>
        </div> */}
        {activity.sourceChannel && (
          <>
            <SourceIcon activity={activity} />
            <button onClick={() => onClickChannel(source, sourceChannel)}>
              {c.displayChannel(sourceChannel)}
            </button>
          </>
        )}
      </div>
      {summary && (
        <pre className="py-4 text-xs text-blue-400 whitespace-pre-wrap">
          {summary.text}
        </pre>
      )}
      {!summary && (
        <Thread
          nesting={0}
          topThread={thread}
          showAfter={showAfter}
          setShowAfter={setShowAfter}
          {...props}
        />
      )}
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
  onClickEntity,
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
      {thread.entities?.length > 0 && (
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
      )}
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
