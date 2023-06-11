import React from "react";
import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

// todo - clicking the selection filters activities
export default function CompactConnection({
  connection,
  directions,
  setSelection,
}) {
  if (!directions) {
    return <div />;
  }
  const [outgoing, incoming] = directions;
  return (
    <button
      className="p-[1px]"
      key={connection.id}
      onClick={() => setSelection(connection)}
    >
      <div className="bg-opacity-0 hover:bg-opacity-50 flex justify-between space-x-1 whitespace-nowrap bg-indigo-900">
        <div className="text-ellisis flex overflow-hidden items-center space-x-1 text-left">
          <OrbitLevelIcon number={connection.level} />
          <div
            style={{
              color: c.orbitLevelColorScale(connection.level),
            }}
          >
            {connection.globalActorName || connection.actorName}
          </div>
        </div>
        <div className="mx-auto" />
        <div className="flex space-x-2">
          <div>In: {incoming}</div>
          <div>Out: {outgoing}</div>
        </div>
      </div>
    </button>
  );
}
