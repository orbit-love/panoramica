import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Activity from "src/components/domains/activity/Activity";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function Preview(props) {
  let { activity, community, handlers } = props;
  let { onClickMember } = handlers;

  var thread = community.threads[activity.id];
  var conversation = community.findActivityById(activity.conversationId);
  var parent = community.findActivityById(activity.parentId);

  var showConversation = activity.id !== conversation?.id;
  var showParent = parent && parent?.id !== conversation?.id;

  return (
    <div className="flex flex-col pt-2 pb-3">
      <div className="text-secondary flex flex-col mb-1 space-y-0 text-sm whitespace-nowrap">
        {showConversation && (
          <ActivityPreview
            activity={conversation}
            community={community}
            onClickMember={onClickMember}
          />
        )}
        {showParent && (
          <ActivityPreview
            activity={parent}
            community={community}
            onClickMember={onClickMember}
          />
        )}
      </div>
      <div>
        <Activity
          activity={activity}
          community={community}
          handlers={handlers}
          showSourceChannel
          showSourceIcon
          timeDisplay={activity.timestamp}
        />
        {thread?.children?.length > 0 && (
          <div className="text-secondary text-sm">
            {thread.children.length} replies
          </div>
        )}
      </div>
    </div>
  );
}

const ActivityPreview = ({ activity, community, onClickMember }) => {
  var activityThread = community.threads[activity.id];
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-1">
        <div className="flex shrink-0 items-center space-x-1">
          <FontAwesomeIcon icon="reply" className="text-xs" />
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
        <div className="text-secondary">
          {activityThread.children.length} replies
        </div>
      )}
    </div>
  );
};
