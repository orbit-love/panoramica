import React from "react";

import CompactMember from "components/compact/member";
import SortOptions from "components/sort_options";

export default function Mission({
  community,
  selection,
  setSelection,
  sort,
  setSort,
  setCommunity,
  levels,
  setConnection,
  entity,
}) {
  var members = community.members;
  if (entity) {
    members = members.filter(
      (member) => entity.members.indexOf(member.globalActor) > -1
    );
  }
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-baseline space-x-1">
        <span className="text-lg font-bold">Members</span>
        <span className="text-md px-1 text-indigo-500">{members.length}</span>
        <span className="!mx-auto" />
      </div>
      <div className="border-b border-indigo-900" />
      <div className="pb-1 text-sm text-indigo-300">
        <SortOptions
          sort={sort}
          setSort={setSort}
          community={community}
          setCommunity={setCommunity}
          levels={levels}
        />
      </div>
      <div className="flex flex-col">
        {[1, 2, 3, 4].map((number) => (
          <div key={number} className="flex flex-col">
            {members
              .filter((member) => member.level === number)
              .map((member) => (
                <CompactMember
                  key={member.id}
                  member={member}
                  selection={selection}
                  setSelection={setSelection}
                  metrics={true}
                  setConnection={setConnection}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
