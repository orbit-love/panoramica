import React from "react";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import CompactMember from "components/compact/member";
import SortOptions from "components/sort_options";

export default function OrbitLevel({
  level,
  levels,
  members,
  setMembers,
  setSelection,
  sort,
  setSort,
}) {
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
      <div className="text-sm italic">{level.description}</div>
      <div className="border-b border-indigo-900"></div>
      <div className="text-sm text-indigo-300">
        <SortOptions
          sort={sort}
          setSort={setSort}
          members={members}
          setMembers={setMembers}
          levels={levels}
        />
      </div>
      <div className="flex flex-col max-h-[50vh] overflow-scroll">
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
