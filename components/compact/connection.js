import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

export default function CompactConnection({
  connectedMember,
  directions,
  connection,
  setConnection,
}) {
  // safety check to remove later
  if (!directions) {
    return <div />;
  }
  const isConnection = connection?.id === connectedMember.id;
  const [outgoing, incoming] = directions;
  const onClick = () => {
    if (isConnection) {
      setConnection(null);
    } else {
      setConnection(connectedMember);
    }
  };
  return (
    <button
      key={connectedMember.id}
      className={classnames(
        "bg-opacity-0 flex overflow-hidden items-center space-x-1 whitespace-nowrap bg-indigo-900",
        {
          "bg-opacity-50": isConnection,
          "hover:bg-opacity-30": !isConnection,
        }
      )}
      onClick={onClick}
    >
      {outgoing > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          <FontAwesomeIcon icon="arrow-right" />
          {" " + outgoing}
        </div>
      )}
      <div className="max-w-[200px] flex items-center space-x-1">
        <OrbitLevelIcon number={connectedMember.level} />
        <div
          className="overflow-hidden text-ellipsis"
          style={{
            color: c.orbitLevelColorScale(connectedMember.level),
          }}
        >
          {connectedMember.globalActorName || connectedMember.actorName}
        </div>
      </div>
      {incoming > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          {incoming + " "}
          <FontAwesomeIcon icon="arrow-right" />
        </div>
      )}
    </button>
  );
}
