import React from "react";
import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
// import MemberStats from "components/compact/member_stats";

export default function CompactMember({ member, setSelection, metrics }) {
  return (
    <>
      <button
        className="p-[1px]"
        key={member.id}
        onClick={() => setSelection(member)}
      >
        <div className="flex items-center space-x-1 opacity-80 hover:opacity-100">
          <OrbitLevelIcon number={member.level.number} />
          <span
            style={{
              color: c.orbitLevelColorScale(member.level.number),
            }}
          >
            {member.name}
          </span>
          {/* <div className="mx-auto" /> */}
          {/* {metrics && <MemberStats member={member} />} */}
        </div>
      </button>
    </>
  );
}
