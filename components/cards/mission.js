import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import CompactMember from "components/compact/member";
import SortOptions from "components/sort_options";

export default function Mission({
  members,
  setSelection,
  sort,
  setSort,
  setMembers,
  levels,
}) {
  return (
    <div className="flex flex-col space-y-4">
      <div
        className="flex items-baseline space-x-2"
        style={{ color: c.visualization.sun.fill }}
      >
        <div>
          <FontAwesomeIcon icon="planet-ringed" className="text-2xl" />
        </div>
        <div className="text-2xl font-semibold">
          Members: {members.list.length}
        </div>
      </div>
      <div className="text-sm text-indigo-300">
        <SortOptions
          sort={sort}
          setSort={setSort}
          members={members}
          setMembers={setMembers}
          levels={levels}
        />
      </div>
      <div className="flex flex-col space-y-2 max-h-[45vh] overflow-scroll">
        {[1, 2, 3, 4].map((number) => (
          <>
            <div className="" style={{ color: c.orbitLevelColorScale(number) }}>
              <span className="font-bold">Orbit {number}</span>
            </div>
            <div className="flex flex-col space-y-0">
              {members.filterMembers({ levelNumber: number }).map((member) => (
                <CompactMember
                  key={member.id}
                  member={member}
                  setSelection={setSelection}
                  metrics={true}
                />
              ))}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
