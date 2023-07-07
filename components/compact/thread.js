import React, { useEffect, useState } from "react";
import classnames from "classnames";

import Activity from "components/compact/activity";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Thread(props) {
  // depth defaults to 0 - top of the thread
  // maxDepth defaults to -1 - no limit
  let { activity, community, depth = 0, maxDepth = -1, handlers } = props;

  // get the thread from the activity, eventually merge these
  // if there is no thread, it's a bug somewhere but protect for now
  var thread = community.threads[activity.id];

  // if the child activity is missing, it's because it didn't get
  // brought back in the time slice, so just skip it
  var childActivities = thread?.children
    ?.map((id) => community.activities.find((a) => a.id === id))
    ?.filter((a) => a);

  // render the children if no maxDepth was supplied or we are less than maxDepth
  var renderChildren = maxDepth === -1 || depth < maxDepth;

  // if we are at the top of the thread but there is a parent, we know
  // that we are rendering individual activities, not only thread tops
  // in this case, add context and make it clear where clicking the activity
  // will go by showing the conversation id
  var showConversation = depth === 0 && thread?.type === "reply";
  var conversation = community.findActivityById(activity.conversationId);

  return (
    <div
      className={classnames("flex flex-col pt-1", {
        "border-l border-indigo-700 pl-3": depth > 0,
      })}
    >
      {showConversation && (
        <div className="flex overflow-hidden items-center mb-2 space-x-1 text-xs text-indigo-300 text-ellipsis whitespace-nowrap">
          <FontAwesomeIcon icon="reply" />
          <div className="overflow-hidden text-ellipsis">
            {conversation.text}
          </div>
        </div>
      )}
      <div className={classnames("pb-1")}>
        <Activity
          activity={activity}
          community={community}
          handlers={handlers}
          showSourceChannel={depth === 0}
          showSourceIcon={depth === 0}
        />
      </div>
      {renderChildren &&
        thread &&
        childActivities?.map((childActivity, index) => {
          var { id } = childActivity;
          return (
            <Thread
              key={id}
              activity={childActivity}
              community={community}
              depth={depth + 1}
              maxDepth={maxDepth}
              handlers={handlers}
              lastChild={index === childActivities.length - 1}
            />
          );
        })}
    </div>
  );
}
