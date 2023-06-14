import React from "react";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

export default function NameAndIcon({
  member,
  setConnection,
  setSelection,
  onClick,
}) {
  if (!member) {
    return <div>No member!</div>;
  }
  if (!onClick) {
    onClick = () => {
      setConnection(null);
      setSelection(member);
    };
  }
  return (
    <button onClick={onClick} className="flex items-center space-x-1">
      <OrbitLevelIcon number={member.level} />
      <div
        className="whitespace-nowrap"
        style={{
          color: c.orbitLevelColorScale(member.level),
        }}
      >
        {member.globalActorName || member.actorName}
      </div>
    </button>
  );
}
