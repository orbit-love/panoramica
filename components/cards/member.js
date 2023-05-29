import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import Meter from "components/meter";

export default function Member({ member, setSelection, setShowNetwork }) {
  const buttonClasses =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none";

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-baseline space-x-2">
        <button onClick={() => setSelection(member.level)}>
          <OrbitLevelIcon number={member.level.number} classes="text-2xl" />
        </button>
        <div
          className="text-2xl font-semibold"
          style={{ color: c.orbitLevelColorScale(member.level.number) }}
        >
          {member.name}
        </div>
      </div>
      <div className="flex flex-col space-y-[-2px]">
        <div className="flex items-center">
          <span className="w-16 font-semibold text-indigo-400">Love</span>
          <Meter
            icon="square"
            number={member.level.number}
            value={member.love}
          ></Meter>
        </div>
        <div className="flex items-center">
          <span className="w-16 font-semibold text-indigo-400">Reach</span>
          <Meter
            icon="square"
            number={member.level.number}
            value={member.reach}
          ></Meter>
        </div>
      </div>
      <div className="flex py-2">
        <button
          className={buttonClasses}
          onClick={() => {
            setShowNetwork(true);
          }}
        >
          <FontAwesomeIcon icon="chart-network" className="px-1" />
          <span> View Connections: {member.connections.length}</span>
        </button>
      </div>
      {/* {!member.summary && <div className="py-1" />}
      {member.summary && (
        <div className="leading-tight">
          <span className="font-bold text-indigo-400">Action </span>
          {member.summary}
        </div>
      )} */}
    </div>
  );
}
