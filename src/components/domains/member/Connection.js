import React from "react";
import classnames from "classnames";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import TimeAgo from "react-timeago";
import c from "src/configuration/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CompactConnection({ member, connection, onClick }) {
  var [outgoing, incoming, lastInteraction] =
    member.connections[connection.globalActor];
  return (
    <button
      key={connection.id}
      className={classnames(
        "group bg-opacity-0 flex overflow-hidden items-center space-x-4 w-full whitespace-nowrap"
      )}
      onClick={(e) => onClick(e, member, connection)}
    >
      <div className="flex-grow">
        <NameAndIcon member={connection} onClick={() => {}} />
      </div>
      <div className="mx-auto"></div>
      <div className="text-secondary">
        <FontAwesomeIcon icon="comment" flip="horizontal" className="text-xs" />
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
