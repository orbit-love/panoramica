import React from "react";
import c from "components/2023/common";

export default function Community({ data, orbits }) {
  const orbiters = c.membersByOrbitLevel(data, orbits);
  const o123_members = orbiters[4];
  const orbiters_percents = [
    Math.round((orbiters[0] / o123_members) * 100),
    Math.round((orbiters[1] / o123_members) * 100),
    Math.round((orbiters[2] / o123_members) * 100),
    Math.round((orbiters[3] / o123_members) * 100),
  ];

  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col">
          <div className="h-2" />
          <div className="text-lg font-semibold">Level {i}</div>
          <div className="italic">{orbits[4 - i]}+ weeks active</div>
          {/* <div className="h-1" /> */}
          <div className="">{orbiters[i]} members</div>
          <div className="">{orbiters_percents[i]}%</div>
        </div>
      ))}
    </>
  );
}
