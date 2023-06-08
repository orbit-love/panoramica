import React from "react";
import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import NumberStats from "components/compact/number_stats";

export default function CompactMember({ member, setSelection, metrics }) {
  return (
    <button
      className="p-[1px]"
      key={member.id}
      onClick={() => setSelection(member)}
    >
      <div className="bg-opacity-0 hover:bg-opacity-50 flex justify-between space-x-1 bg-indigo-900">
        <div className="flex items-center space-x-1">
          <OrbitLevelIcon number={member.level} />
          <div
            className="overflow-hidden w-56 text-left text-ellipsis whitespace-nowrap"
            style={{
              color: c.orbitLevelColorScale(member.level),
            }}
          >
            {member.name}
          </div>
        </div>
        <div className="mx-auto" />
        {metrics && <NumberStats member={member} />}
      </div>
    </button>
  );
}
