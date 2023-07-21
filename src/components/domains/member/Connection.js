import React from "react";
import classnames from "classnames";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import TimeAgo from "react-timeago";
import c from "src/configuration/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CompactConnection({
  member,
  connectedMember,
  connection,
  onClick,
}) {
  var [outgoing, incoming, lastInteraction] = connection;
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
      <div className="text-secondary">
        <FontAwesomeIcon icon="comment" flip="horizontal" />
        &nbsp;
        {outgoing + incoming}
      </div>
      <TimeAgo
        className="text-secondary ml-6"
        date={lastInteraction}
        title={c.formatDate(lastInteraction)}
      />
    </button>
  );
}
