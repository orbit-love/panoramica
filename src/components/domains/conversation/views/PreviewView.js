import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Activity from "src/components/domains/activity/Activity";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function PreviewView(props) {
  let { activity, handlers, onExpand, term } = props;
  let { onClickMember } = handlers;

  const conversation = activity.conversation;
  const descendants = conversation.descendants;
  const parent = descendants.find((a) => a.id === activity.parent?.id);
  const replies = descendants.filter((a) => a.parent?.id === activity.id);

  const showConversation = activity.id !== conversation.id;
  const showParent = parent && parent.id !== conversation.id;

  return (
    <div onClick={onExpand} className="flex flex-col space-y-1 cursor-pointer">
      <div className="text-secondary flex flex-col text-sm whitespace-nowrap">
        {showConversation && (
          <ActivityPreview
            activity={conversation}
            descendants={descendants}
            onClickMember={onClickMember}
            onExpand={onExpand}
          />
        )}
        {showParent && (
          <ActivityPreview
            activity={parent}
            descendants={descendants}
            onClickMember={onClickMember}
            onExpand={onExpand}
          />
        )}
      </div>
      <div>
        <Activity
          activity={activity}
          handlers={handlers}
          showSourceChannel
          showSourceIcon
          timeDisplay={activity.timestamp}
          term={term}
          linkTimestamp={true}
        />
        <Replies
          replies={replies}
          onExpand={onExpand}
          showZeroReplies={!showConversation}
        />
      </div>
    </div>
  );
}

const ActivityPreview = ({
  activity,
  descendants,
  onClickMember,
  onExpand,
}) => {
  var replies = descendants.filter((a) => a.parent?.id === activity.id);
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-1">
        <div className="flex shrink-0 items-center space-x-1">
          <FontAwesomeIcon icon="reply" className="text-xs" />
          <NameAndIcon member={activity.member} onClick={onClickMember} />
        </div>
        <button
          onClick={onExpand}
          className="shrink-1 overflow-hidden text-ellipsis hover:underline"
        >
          {activity.text}
        </button>
      </div>
      <Replies replies={replies} onExpand={onExpand} replyMinimum={2} />
    </div>
  );
};

const Replies = ({
  replies,
  onExpand,
  replyMinimum = 1,
  showZeroReplies = true,
}) => {
  // we need to know if a reply is already showing
  var replyCount = replies.length || 0;
  replyCount = replyCount > 0 ? replyCount - 1 : replyCount;
  return (
    <>
      {replyCount >= replyMinimum && (
        <button
          onClick={onExpand}
          className="text-secondary text-sm text-left hover:underline"
        >
          {replyCount === 1 && "1 more reply"}
          {replyCount > 1 && `${replyCount} more replies`}
        </button>
      )}
      {replyCount === 0 && showZeroReplies && (
        <div className="text-secondary text-sm">0 replies</div>
      )}
    </>
  );
};
