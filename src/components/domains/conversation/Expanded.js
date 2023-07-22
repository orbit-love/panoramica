import React from "react";
import classnames from "classnames";
import Activity from "src/components/domains/activity/Activity";

export default function ExpandedConversation(props) {
  let { activity, community, depth = 0, handlers } = props;

  var thread = community.threads[activity.id];
  var parent = community.findActivityById(activity.parentId);

  var childActivities = thread.children
    ?.map((id) => community.activities.find((a) => a.id === id))
    ?.filter((a) => a);

  var timeDisplay =
    depth === 0 ? activity.timestamp : [parent.timestamp, activity.timestamp];

  return (
    <div
      className={classnames("flex flex-col", {
        "pt-2 pb-3": depth === 0,
        "border-l border-gray-200 dark:border-gray-700 pl-3": depth > 0,
      })}
    >
      <Activity
        activity={activity}
        community={community}
        handlers={handlers}
        showSourceChannel={depth === 0}
        showSourceIcon={depth === 0}
        timeDisplay={timeDisplay}
      />
      {childActivities?.map((childActivity, index) => {
        var { id } = childActivity;
        return (
          <ExpandedConversation
            key={id}
            activity={childActivity}
            community={community}
            depth={depth + 1}
            handlers={handlers}
            lastChild={index === childActivities.length - 1}
          />
        );
      })}
    </div>
  );
}
