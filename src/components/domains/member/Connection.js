import React from "react";
import classnames from "classnames";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import TimeAgo from "react-timeago";
import utils from "src/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CompactConnection({
  connectedMember,
  lastInteractedAt,
  member,
  onClick,
  conversationCount,
  activityCount,
}) {
  return (
    <button
      key={connectedMember.id}
      className={classnames(
        "group bg-opacity-0 flex overflow-hidden items-center space-x-4 w-full whitespace-nowrap"
      )}
      onClick={(e) => onClick(e, member, connectedMember)}
    >
      <div className="flex-grow">
        <NameAndIcon member={connectedMember} onClick={() => {}} />
      </div>
      <div className="mx-auto"></div>
      <TimeAgo
        className="ml-6 text-gray-400 dark:text-gray-600"
        date={lastInteractedAt}
        title={`Last interacted on ${utils.formatDate(lastInteractedAt)}`}
      />
      <div
        title={`Messaged ${activityCount} times across ${conversationCount} conversations`}
        className="text-secondary"
      >
        <FontAwesomeIcon icon="comment" flip="horizontal" />
        &nbsp;
        <span title={activityCount}>{conversationCount}</span>
      </div>
    </button>
  );
}
