import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Orbit1 from "components/icons/orbit_1";
import Orbit2 from "components/icons/orbit_2";
import Orbit3 from "components/icons/orbit_3";
import Orbit4 from "components/icons/orbit_4";
import Meter from "components/meter";
import Prose from "components/visualization/prose";

const OrbitLevelIcon = ({ member, classes }) => {
  return (
    <>
      {member.level.number === 1 && <Orbit1 classes={classes} />}
      {member.level.number === 2 && <Orbit2 classes={classes} />}
      {member.level.number === 3 && <Orbit3 classes={classes} />}
      {member.level.number === 4 && <Orbit4 classes={classes} />}
    </>
  );
};

export default function Member({ member, members, graph, setSelection }) {
  const orbitLevels = {
    1: "Orbit Level 1: Advocates",
    2: "Orbit Level 2: Contributors",
    3: "Orbit Level 3: Participants",
    4: "Orbit Level 4: Explorers",
  };
  var orbitLevelTitle = orbitLevels[member.level];
  const connections = members.getConnections({ member });
  // show connections to highest orbit levels first
  connections.sort((a, b) => a.level.number - b.level.number);

  const setSelectionAndFocusItem = (connection) => {
    setSelection(connection);
    const node = graph.findById(connection.id);
    graph.focusItem(node, true);
  };

  return (
    <Prose>
      <div className="bg-[#1D1640] px-4 py-3 rounded-md border border-indigo-600">
        <div className="flex space-x-8">
          <div className="flex flex-col space-y-2">
            <div className="flex items-baseline space-x-2">
              <div className="cursor-help" title={orbitLevelTitle}>
                <OrbitLevelIcon member={member} classes="text-xl" />
              </div>
              <div className="text-xl font-semibold">{member.name}</div>
            </div>
            <div className="flex items-center space-x-1 font-bold text-indigo-400">
              <FontAwesomeIcon icon="chart-network" />
              <span>{connections.length}</span>
            </div>
            <div className="flex items-center space-x-1 font-bold text-indigo-400">
              <FontAwesomeIcon icon="signal-stream" />
              <span>{member.reach}/3</span>
            </div>
          </div>
          <div>
            <div className="flex flex-col space-y-1">
              {connections.map((connection) => (
                <button
                  className="w-36 text-indigo-100 hover:text-yellow-100"
                  key={connection.id}
                  onClick={() => setSelectionAndFocusItem(connection)}
                >
                  <div className="flex items-center space-x-1">
                    <OrbitLevelIcon member={connection} classes="" />
                    <span>{connection.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Prose>
  );
}
