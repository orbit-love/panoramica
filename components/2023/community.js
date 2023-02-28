import React from "react";
import c from "components/2023/common";

export default function Community({ data, orbits }) {
  const orbiters = c.membersByOrbitLevel(data, orbits);
  const orbiters_percents = [
    0,
    Math.round((orbiters[1] / orbiters[0]) * 10) / 10,
    Math.round((orbiters[2] / orbiters[0]) * 10) / 10,
    Math.round((orbiters[3] / orbiters[0]) * 10) / 10,
  ];

  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col">
          <div className="h-2" />
          <div className="flex space-x-2">
            <div className="font-semibold">Level {i}</div>
            {/* <div className="italic">{orbits[4 - i]}+ weeks active</div> */}
            {/* <div className="h-1" /> */}
            <div className="">{orbiters[i - 1]} members</div>
            {i > 1 && <div className="">{orbiters_percents[i - 1]}:1</div>}
          </div>
        </div>
      ))}
    </>
  );
}
