import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

// todo - clicking the selection filters activities
export default function CompactConnection({
  connection,
  directions,
  setSelection,
}) {
  // safety check to remove later
  if (!directions) {
    return <div />;
  }
  const [outgoing, incoming] = directions;
  return (
    <button
      key={connection.id}
      className="bg-opacity-0 hover:bg-opacity-50 flex overflow-hidden items-center space-x-1 whitespace-nowrap bg-indigo-900"
      onClick={() => setSelection(connection)}
    >
      {outgoing > 0 && (
        <div className="w-8 text-xs text-indigo-400">
          <FontAwesomeIcon icon="arrow-right" />
          {" " + outgoing}
        </div>
      )}
      <div className="max-w-[200px] flex items-center space-x-1">
        <OrbitLevelIcon number={connection.level} />
        <div
          className="overflow-hidden text-ellipsis"
          style={{
            color: c.orbitLevelColorScale(connection.level),
          }}
        >
          {connection.globalActorName || connection.actorName}
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
