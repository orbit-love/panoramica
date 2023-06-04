import React from "react";
import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import MemberStats from "components/compact/member_stats";

export default function CompactMember({ member, setSelection, metrics }) {
  return (
    <button
      className="p-[1px]"
      key={member.id}
      onClick={() => setSelection(member)}
    >
      <div className="flex justify-between space-x-1 bg-indigo-900 bg-opacity-0 hover:bg-opacity-50">
        <div className="flex items-center space-x-1">
          <OrbitLevelIcon number={member.level.number} />
          <div
            className="w-24 text-left"
            style={{
              color: c.orbitLevelColorScale(member.level.number),
            }}
          >
            {member.name}
          </div>
        </div>
        <div className="mx-auto" />
        {metrics && <MemberStats member={member} />}
      </div>
    </button>
  );
}
