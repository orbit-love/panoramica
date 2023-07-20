import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import Activity from "src/components/domains/activity/Activity";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function Thread(props) {
  // depth defaults to 0 - top of the thread
  // maxDepth defaults to -1 - no limit
  let { activity, community, depth = 0, maxDepth = -1, handlers } = props;
  let { onClickMember } = handlers;

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
  var conversation = community.findActivityById(activity.conversationId);
  var parent = community.findActivityById(activity.parentId);

  var showConversation =
    conversation && depth === 0 && thread?.type === "reply";
  var showParent =
    parent?.id !== conversation?.id && depth === 0 && thread.type === "reply";

  let Preview = ({ activity, onClickMember }) => {
    var activityThread = community.threads[activity.id];
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center space-x-1">
          <div className="flex shrink-0 items-center space-x-1">
            <FontAwesomeIcon icon="reply" className="text-sm opacity-80" />
            <NameAndIcon
              member={community.findMemberByActivity(activity)}
              onClick={onClickMember}
            />
          </div>
          <div className="shrink-1 overflow-hidden text-ellipsis">
            {activity.text}
          </div>
        </div>
        {activityThread.children.length > 1 && (
          <div className="text-secondary pl-3">
            {activityThread.children.length} replies
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={classnames("flex flex-col pt-1", {
        "border-l border-gray-200 dark:border-gray-700 pl-3": depth > 0,
      })}
    >
      {showConversation && (
        <div className="text-secondary flex flex-col mb-2 space-y-2 text-sm whitespace-nowrap">
          {conversation && (
            <Preview activity={conversation} onClickMember={onClickMember} />
          )}
          {showParent && (
            <div className="pl-3">
              <Preview activity={parent} onClickMember={onClickMember} />
            </div>
          )}
        </div>
      )}
      <div
        className={classnames("pb-1", {
          "pl-3": showConversation,
          "pl-7": showParent,
        })}
      >
        <Activity
          activity={activity}
          community={community}
          handlers={handlers}
          showSourceChannel={depth === 0}
          showSourceIcon={depth === 0}
          timeDisplay={
            depth === 0
              ? activity.timestamp
              : [parent.timestamp, activity.timestamp]
          }
        />
        {/* if we aren't recursing but there are children, put the number */}
        {!renderChildren && thread?.children?.length > 0 && (
          <div className="text-sm">{thread.children.length} replies</div>
        )}
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
