import React from "react";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

export default function NameAndIcon({ member, onClick }) {
  if (!member) {
    return <div>No member!</div>;
  }
  if (!onClick) {
    onClick = (e) => {
      e.stopPropagation();
    };
  }
  return (
    <div
      onClick={(e) => onClick(e, member)}
      className="flex overflow-hidden items-center space-x-1 cursor-pointer"
    >
      <OrbitLevelIcon number={member.level} />
      <div
        className="overflow-hidden text-ellipsis whitespace-nowrap hover:underline"
        style={{
          color: c.orbitLevelColorScale(member.level),
        }}
      >
        {member.globalActorName || member.actorName}
      </div>
    </div>
  );
}
