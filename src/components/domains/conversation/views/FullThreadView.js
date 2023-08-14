import React from "react";
import classnames from "classnames";
import Activity from "src/components/domains/activity/Activity";

export default function FullThreadView(props) {
  // activity is also passed in but we don't use it
  // the activity represents the message that was clicked on
  // but for the thread rendering purposes we start at the top
  var { conversation } = props;

  // this component provides the same value for conversation
  // descendants at all levels of the thread; that information
  // is used to connect parents and replies
  return (
    <div className="p-6">
      <FullThreadViewInner
        {...props}
        activity={conversation}
        conversation={conversation}
        descendants={conversation?.descendants}
      />
    </div>
  );
}

function FullThreadViewInner({
  activity,
  conversation,
  descendants,
  depth = 0,
  handlers,
  term,
  linkAllTimestamps,
}) {
  // use the descendants of the conversation to find the parent and replies
  // of the current activity - this information is not fetched at query time
  // because the depth is arbitrary
  const parent = descendants.find((a) => a.id === activity.parent?.id);
  const replies = descendants.filter((a) => a.parent?.id === activity.id);

  // If this is a reply, show the time difference between this activity and either
  // the previous sibling or the parent activity
  var timeDisplay = activity.timestamp;
  if (depth > 0 && parent) {
    var index = replies.map((a) => a.id).indexOf(activity.id);
    var previousSibling = replies[index - 1];
    if (previousSibling) {
      timeDisplay = [previousSibling.timestamp, activity.timestamp];
    } else {
      timeDisplay = [parent.timestamp, activity.timestamp];
    }
  }

  return (
    <div
      className={classnames("flex flex-col expand-images", {
        "border-l border-gray-200 dark:border-gray-700 pl-3": depth > 0,
      })}
    >
      <Activity
        activity={activity}
        conversation={conversation}
        handlers={handlers}
        showSourceChannel={depth === 0}
        showSourceIcon={depth === 0}
        linkTimestamp={linkAllTimestamps || depth === 0}
        timeDisplay={timeDisplay}
        term={term}
      />
      {replies.map((reply) => {
        var { id } = reply;
        return (
          <FullThreadViewInner
            key={id}
            activity={reply}
            conversation={conversation}
            descendants={descendants}
            depth={depth + 1}
            handlers={handlers}
            term={term}
            linkAllTimestamps={linkAllTimestamps}
          />
        );
      })}
    </div>
  );
}
