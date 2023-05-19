import React from "react";
import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";
import Meter from "components/meter";
import Prose from "components/visualization/prose";

export default function Member({
  member,
  members,
  setSelection,
  setShowNetwork,
}) {
  const classes = "text-2xl";
  const orbitLevels = {
    1: "Orbit Level 1: Advocates",
    2: "Orbit Level 2: Contributors",
    3: "Orbit Level 3: Participants",
    4: "Orbit Level 4: Explorers",
  };
  var orbitLevelTitle = orbitLevels[member.level];
  const connections = members.getConnections({ member });

  return (
    <Prose>
      <div className="flex items-baseline space-x-2">
        <div className="cursor-help" title={orbitLevelTitle}>
          {member.level.number === 1 && <Orbit1 classes={classes} />}
          {member.level.number === 2 && <Orbit2 classes={classes} />}
          {member.level.number === 3 && <Orbit3 classes={classes} />}
          {member.level.number === 4 && <Orbit4 classes={classes} />}
        </div>
        <div className="text-2xl font-semibold">{member.name}</div>
      </div>
      <div className="flex flex-col my-4 space-y-2">
        <div className="flex items-center">
          <span className="w-16 font-bold text-indigo-400">Love</span>
          <Meter
            icon="square"
            number={member.level.number}
            value={member.love}
            classes=""
          ></Meter>
        </div>
        <div className="flex items-center">
          <span className="w-16 font-bold text-indigo-400">Reach</span>
          <Meter
            icon="square"
            number={member.level.number}
            value={member.reach}
            classes=""
          ></Meter>
        </div>
      </div>
      {connections.length > 0 && (
        <div className="flex flex-col items-start space-y-1">
          <button
            className="text-pink-300 hover:text-pink-100"
            onClick={() => setShowNetwork(true)}
          >
            Connections ({connections.length}):
          </button>
          <div className="flex space-x-2">
            {connections.map((connection) => (
              <button
                className="text-pink-300 hover:text-pink-100"
                key={connection.id}
                onClick={() => setSelection(connection)}
              >
                {connection.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {connections.length === 0 && (
        <div className="text-pink-300">No Connections</div>
      )}
      {!member.summary && <div className="py-1" />}
      {member.summary && <div className="leading-tight">{member.summary}</div>}
    </Prose>
  );
}
