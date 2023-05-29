import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import CompactMember from "components/compact/member";

export default function OrbitLevel({ level, members, setSelection }) {
  const levelMembers = members.filterMembers({ levelNumber: level.number });

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-baseline space-x-2">
        <div>
          <OrbitLevelIcon number={level.number} classes="text-2xl" />
        </div>
        <div
          className="text-2xl font-semibold"
          style={{ color: c.orbitLevelColorScale(level.number) }}
        >
          {level.name} ({levelMembers.length})
        </div>
      </div>
      <div className="italic text-sm">{level.description}</div>
      <div className="border-b border-indigo-900"></div>
      <div className="flex flex-col max-h-[200px] overflow-scroll">
        {levelMembers.map((member) => (
          <CompactMember
            key={member.id}
            member={member}
            setSelection={setSelection}
            metrics={true}
          />
        ))}
      </div>
    </div>
  );
}
