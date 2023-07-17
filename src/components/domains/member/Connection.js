import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function CompactConnection({
  member,
  connection,
  directions,
  onClick,
}) {
  const [outgoing, incoming] = directions;
  return (
    <button
      key={connection.id}
      className={classnames(
        "bg-opacity-0 flex overflow-hidden items-center space-x-1 whitespace-nowrap bg-indigo-900"
      )}
      onClick={(e) => onClick(e, member, connection)}
    >
      {outgoing > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          <FontAwesomeIcon icon="arrow-right" />
          {" " + outgoing}
        </div>
      )}
      <NameAndIcon member={connection} onClick={() => {}} />
      {incoming > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          {incoming + " "}
          <FontAwesomeIcon icon="arrow-right" />
        </div>
      )}
    </button>
  );
}
