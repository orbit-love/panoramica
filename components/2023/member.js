import React from "react";
import c from "components/2023/common";

export default function Member({ data, memberId, orbits }) {
  const member = data.find((elem) => elem[0] === memberId);
  const hotColdColorScale = c.hotColdColorScale();

  return (
    <div className="flex flex-col">
      <div className="h-2" />
      <div className="text-lg italic font-semibold">{member[2]}</div>
      <div className="text-lg font-semibold">{member[4]}</div>
      <div className="">
        Level {c.orbitLevel(member[1], orbits)} — {member[1]}/52 wks
      </div>
      <div className="" style={{ color: hotColdColorScale(member[3]) }}>
        Active {member[3]} / 6 last weeks
      </div>
    </div>
  );
}
