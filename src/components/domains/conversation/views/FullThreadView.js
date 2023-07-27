import React from "react";
import classnames from "classnames";
import Activity from "src/components/domains/activity/Activity";

export default function FullThreadView(props) {
  let { activity, community, depth = 0, handlers } = props;

  var conversation = community.conversations[activity.id];
  var parentActivity = community.findActivityById(activity.parentId);

  // If this is a reply, show the time difference between this activity and either
  // the previous sibling or the parent activity
  var timeDisplay = activity.timestamp;
  if (depth > 0 && parentActivity) {
    var parentConversation = community.conversations[parentActivity.id];
    var index = parentConversation.children.indexOf(activity.id);
    var previousSiblingId = parentConversation.children[index - 1];
    var previousSibling = community.findActivityById(previousSiblingId);
    if (previousSibling) {
      timeDisplay = [previousSibling.timestamp, activity.timestamp];
    } else {
      timeDisplay = [parentActivity.timestamp, activity.timestamp];
    }
  }

  var childActivities = conversation.children
    ?.map((id) => community.activities.find((a) => a.id === id))
    ?.filter((a) => a);

  return (
    <div
      className={classnames("flex flex-col expand-images", {
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
          <FullThreadView
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
