import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import Meter from "components/meter";

export default function Member({
  member,
  setSelection,
  showNetwork,
  setShowNetwork,
  levels,
}) {
  const buttonClasses =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none outline-none";

  const color = c.orbitLevelColorScale(member.level);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-baseline space-x-2">
        <button
          className="flex items-center"
          onClick={() => setSelection(levels[member.level])}
        >
          <FontAwesomeIcon
            icon="chevron-left"
            className="text-xl"
            style={{ color }}
          />
          <OrbitLevelIcon number={member.level} classes="text-2xl" />
        </button>
        <div className="text-2xl font-semibold" style={{ color }}>
          {member.name}
        </div>
      </div>
      <div className="flex flex-col space-y-[-2px]">
        <div className="flex items-center">
          <div className="w-16 font-semibold text-indigo-400">Love</div>
          <Meter
            icon="square"
            number={member.level}
            value={member.love}
          ></Meter>
        </div>
        <div className="flex items-center">
          <div className="w-16 font-semibold text-indigo-400">Reach</div>
          <Meter
            icon="square"
            number={member.level}
            value={member.reach}
          ></Meter>
        </div>
      </div>
      {member.connections && (
        <div className="flex py-2">
          <button
            className={buttonClasses}
            onClick={() => {
              setShowNetwork(!showNetwork);
            }}
          >
            <FontAwesomeIcon icon="chart-network" className="px-1" />
            <span>
              {showNetwork
                ? ` Hide Connections: ${member.connections.length}`
                : ` Show Connections: ${member.connections.length}`}
            </span>
          </button>
        </div>
      )}
      <div className="py-1" />
      {member.activityCount}
    </div>
  );
}
