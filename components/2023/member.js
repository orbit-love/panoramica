import React from "react";
import c from "components/2023/common";

export default function Member({ member, orbits, expanded, onReset }) {
  const hotColdColorScale = c.hotColdColorScale();

  return (
    <div className="flex relative flex-col py-1 px-4 pointer-events-auto">
      {expanded && (
        <div className="absolute top-2 right-2">
          <button className={`btn btn-pink mb-2`} onClick={onReset}>
            X
          </button>
        </div>
      )}
      <div className="h-2" />
      <div className="text-lg font-semibold">{member.member_name}</div>
      <div className="text-lg italic font-semibold">{member.member_slug}</div>
      <div className="">
        Level {c.orbitLevel(member.weeks_active_last_52, orbits)} —{" "}
        {member.weeks_active_last_52}/52 wks
      </div>
      <div style={{ color: hotColdColorScale(member.weeks_active_last_6) }}>
        Active {member.weeks_active_last_6} / 6 last weeks
      </div>
      {expanded && <div className="my-36">More content here!</div>}
    </div>
  );
}
