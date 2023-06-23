import React from "react";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

export default function NameAndIcon({
  member,
  setConnection,
  selection,
  setSelection,
  onClick,
}) {
  if (!member) {
    return <div>No member!</div>;
  }
  if (!onClick) {
    onClick = (member) => {
      setConnection(null);
      if (selection?.id === member.id) {
        setSelection({ name: "Mission" });
      } else {
        setSelection(member);
      }
    };
  }
  return (
    <div
      onClick={() => onClick(member)}
      className="flex items-center space-x-1 cursor-pointer"
    >
      <OrbitLevelIcon number={member.level} />
      <div
        className="whitespace-nowrap"
        style={{
          color: c.orbitLevelColorScale(member.level),
        }}
      >
        {member.globalActorName || member.actorName}
      </div>
    </div>
  );
}
