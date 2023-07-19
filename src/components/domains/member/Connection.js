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
    <div className="flex">
      <button
        key={connection.id}
        className={classnames(
          "bg-opacity-0 flex overflow-hidden items-center space-x-1 whitespace-nowrap bg-indigo-900"
        )}
        onClick={(e) => onClick(e, member, connection)}
      >
        <NameAndIcon
          member={connection}
          onClick={() => {}}
          suffix={
            <>
              &nbsp;
              {outgoing + incoming}
              <FontAwesomeIcon icon="right-left" className="text-xs" />
            </>
          }
        />
      </button>
      <TimeAgo
        className="ml-8"
        date={lastInteraction}
        title={c.formatDate(lastInteraction)}
      />
    </div>
  );
}
