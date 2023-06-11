import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import CompactMember from "components/compact/member";
import SortOptions from "components/sort_options";

export default function Mission({
  community,
  setSelection,
  sort,
  setSort,
  setCommunity,
  levels,
}) {
  return (
    <div className="flex flex-col space-y-2">
      <div
        className="flex items-baseline space-x-2"
        style={{ color: c.visualization.sun.fill }}
      >
        <div>
          <FontAwesomeIcon icon="planet-ringed" className="text-2xl" />
        </div>
        <div className="text-2xl font-semibold">
          Members: {community.members.length}
        </div>
      </div>
      <div className="pb-1 text-sm text-indigo-300">
        <SortOptions
          sort={sort}
          setSort={setSort}
          community={community}
          setCommunity={setCommunity}
          levels={levels}
        />
      </div>
      <div className="flex flex-col max-h-[40vh] overflow-scroll">
        {[1, 2, 3, 4].map((number) => (
          <div key={number} className="flex flex-col space-y-0">
            {community.members
              .filter((member) => member.level === number)
              .map((member) => (
                <CompactMember
                  key={member.id}
                  member={member}
                  setSelection={setSelection}
                  metrics={true}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
