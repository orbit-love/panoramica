import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Activity from "src/components/domains/activity/Activity";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function PreviewView(props) {
  let { activity, community, handlers } = props;
  let { onClickMember } = handlers;

  var conversation = community.conversations[activity.id];
  var conversation = community.findActivityById(activity.conversationId);
  var parent = community.findActivityById(activity.parentId);

  var showConversation = activity.id !== conversation?.id;
  var showParent = parent && parent?.id !== conversation?.id;

  return (
    <div className="flex flex-col">
      <div className="text-secondary flex flex-col text-sm whitespace-nowrap">
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
        {conversation?.children?.length > 0 && (
          <div className="text-secondary text-sm">
            {conversation.children.length} replies
          </div>
        )}
        {conversation?.children?.length === 0 && (
          <div className="text-secondary text-sm">No replies</div>
        )}
      </div>
    </div>
  );
}

const ActivityPreview = ({ activity, community, onClickMember }) => {
  var activityConversation = community.conversations[activity.id];
  return (
    <div className="flex flex-col">
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
      {activityConversation.children.length > 1 && (
        <div className="text-secondary">
          {activityConversation.children.length} replies
        </div>
      )}
    </div>
  );
};
