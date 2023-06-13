import React from "react";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

export default function NameAndIcon({
  member,
  setConnection,
  setSelection,
  onClick,
}) {
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
        className="overflow-hidden text-left text-ellipsis whitespace-nowrap hover:underline"
        style={{
          color: c.orbitLevelColorScale(member.level),
        }}
      >
        {member.globalActorName || member.actorName}
      </div>
    </button>
  );
}
