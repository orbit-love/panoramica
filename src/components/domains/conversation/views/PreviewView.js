import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Activity from "src/components/domains/activity/Activity";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function PreviewView(props) {
  let { activity, community, handlers, onExpand } = props;
  let { onClickMember } = handlers;

  const conversation = community.conversations[activity.id];
  const conversationActivity = community.findActivityById(
    activity.conversationId
  );
  const parentActivity = community.findActivityById(activity.parentId);

  const showConversation = activity.id !== conversationActivity?.id;
  const showParent =
    parentActivity && parentActivity?.id !== conversationActivity?.id;

  return (
    <div className="flex flex-col space-y-1">
      <div className="text-secondary flex flex-col text-sm whitespace-nowrap">
        {showConversation && (
          <ActivityPreview
            activity={conversationActivity}
            conversation={community.conversations[conversationActivity.id]}
            community={community}
            onClickMember={onClickMember}
            onExpand={onExpand}
          />
        )}
        {showParent && (
          <ActivityPreview
            activity={parentActivity}
            conversation={community.conversations[parentActivity.id]}
            community={community}
            onClickMember={onClickMember}
            onExpand={onExpand}
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
        <Replies
          conversation={conversation}
          onExpand={onExpand}
          showNoReplies={!showConversation}
        />
      </div>
    </div>
  );
}

const ActivityPreview = ({
  activity,
  conversation,
  community,
  onClickMember,
  onExpand,
}) => {
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
        <button
          onClick={onExpand}
          className="shrink-1 overflow-hidden text-ellipsis hover:underline"
        >
          {activity.text}
        </button>
      </div>
      <Replies
        conversation={conversation}
        onExpand={onExpand}
        replyMinimum={2}
      />
    </div>
  );
};

const Replies = ({
  conversation,
  onExpand,
  replyMinimum = 1,
  showNoReplies = true,
}) => {
  const childrenLength = conversation.children?.length || 0;
  return (
    <div className="text-secondary text-sm">
      {childrenLength >= replyMinimum && (
        <button onClick={onExpand} className="hover:underline">
          {childrenLength === 1 && "1 reply"}
          {childrenLength > 1 && `${childrenLength} replies`}
        </button>
      )}
      {childrenLength === 0 && showNoReplies && (
        <div className="text-secondary text-sm">0 replies</div>
      )}
    </div>
  );
};
