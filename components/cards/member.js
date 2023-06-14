import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";
import CompactConnections from "components/compact/connections";
import Meter from "components/meter";

export default function Member({
  member,
  community,
  setSelection,
  showNetwork,
  setShowNetwork,
  connection,
  setConnection,
}) {
  const buttonClasses =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none outline-none";

  const color = c.orbitLevelColorScale(member.level);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex overflow-hidden items-baseline space-x-1 text-ellipsis whitespace-nowrap">
        <button
          className="flex items-center"
          onClick={() => {
            setSelection({ name: "Mission" });
            setConnection(null);
          }}
        >
          <FontAwesomeIcon icon="chevron-left" className="" style={{ color }} />
        </button>
        <div className="text-lg font-bold">
          <NameAndIcon
            member={member}
            setSelection={setSelection}
            setConnection={setConnection}
          />
        </div>
      </div>
      <div className="border-b border-indigo-900" />
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
          <div className="flex flex-col">
            <CompactConnections
              member={member}
              community={community}
              setSelection={setSelection}
              connection={connection}
              setConnection={setConnection}
            />
          </div>
        </>
      )}
      {false && (
        <>
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
        </>
      )}
    </div>
  );
}
