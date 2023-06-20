import React from "react";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import CompactMember from "components/compact/member";
import SortOptions from "components/sort_options";
import Entity from "components/compact/entity";

export default function OrbitLevel({
  level,
  levels,
  community,
  setCommunity,
  selection,
  setSelection,
  sort,
  setSort,
  setConnection,
  entity,
  setEntity,
}) {
  var title;
  var members = community.members.filter(
    (member) => member.level === level.number
  );
  if (entity) {
    members = members.filter(
      (member) => entity.members.indexOf(member.globalActor) > -1
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <OrbitLevelIcon number={level.number} classes="text-lg" />
          <span
            className="text-lg font-bold"
            style={{ color: c.orbitLevelColorScale(level.number) }}
          >
            {level.name}
          </span>
        </div>
        <span className="text-md text-indigo-500">{members.length}</span>
        <span className="!mx-auto" />
        <div className="flex overflow-hidden items-baseline space-x-2 text-sm">
          {title}
        </div>
      </div>
      <div className="border-b border-indigo-900" />
      <div className="text-sm text-indigo-300">
        <SortOptions
          sort={sort}
          setSort={setSort}
          community={community}
          setCommunity={setCommunity}
          levels={levels}
        />
      </div>
      <div className="flex flex-col">
        {members.map((member) => (
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
    </div>
  );
}
