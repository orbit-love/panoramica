import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import CompactMember from "components/compact/member";
import Meter from "components/meter";

export default function Member({
  member,
  setSelection,
  showNetwork,
  setShowNetwork,
}) {
  const buttonClasses =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none outline-none";

  const color = c.orbitLevelColorScale(member.level);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-baseline space-x-2">
        <button
          className="flex items-center"
          onClick={() => setSelection({ name: "Mission" })}
        >
          <FontAwesomeIcon
            icon="chevron-left"
            className="text-xl"
            style={{ color }}
          />
          <OrbitLevelIcon number={member.level} classes="text-2xl" />
        </button>
        <div className="text-2xl font-semibold" style={{ color }}>
          {member.actorName}
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
      {member.connectionCount > 0 && (
        <div className="flex py-2">
          <button
            className={buttonClasses}
            onClick={() => {
              setShowNetwork(!showNetwork);
            }}
          >
            <FontAwesomeIcon icon="chart-network" className="px-1" />
            <span>{showNetwork ? ` Hide Graph` : ` Show Graph`}</span>
          </button>
        </div>
      )}
      <div className="flex flex-col space-y-[-2px]">
        <div className="flex font-semibold">
          <span className="w-32 text-indigo-400">Activities</span>
          <span>{member.activityCount}</span>
        </div>
        <div className="flex font-semibold">
          <span className="w-32 text-indigo-400">Connections</span>
          <span>{member.connectionCount}</span>
        </div>
      </div>
      {member.connectionCount > 0 && (
        <>
          <div className="border-b border-indigo-800" />
          <div className="flex flex-col max-h-[25vh] overflow-scroll">
            {member.connectedMembers.map((connection) => (
              <CompactMember
                key={connection.id}
                member={connection}
                setSelection={setSelection}
              />
            ))}
          </div>
        </>
      )}
      <div className="border-b border-indigo-800" />
      <div className="flex flex-col space-y-[-2px]">
        <div className="flex">
          <span className="w-32 text-indigo-400">Actor</span>
          <span>{member.actor}</span>
        </div>
        {member.actorName && (
          <div className="flex">
            <span className="w-32 text-indigo-400">Actor Name</span>
            <span>{member.actorName}</span>
          </div>
        )}
        {member.globalActor && (
          <div className="flex">
            <span className="w-32 text-indigo-400">Global Actor</span>
            <span>{member.globalActor}</span>
          </div>
        )}
        {member.globalActorName && (
          <div className="flex">
            <span className="w-32 text-indigo-400">Global Name</span>
            <span>{member.globalActorName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
