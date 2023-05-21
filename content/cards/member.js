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

export default function Member({
  member,
  members,
  showNetwork,
  setSelection,
  setShowNetwork,
  setExpanded,
  graph,
}) {
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
  const buttonClasses =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none";

  const onConnectionClick = (connection) => {
    // clear selections
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    nodes.forEach((node) => graph.clearItemStates(node, "selected"));
    edges.forEach((edge) => graph.clearItemStates(edge, "selected"));

    // add selected state to node and edges
    const node = graph.findById(connection.id);
    graph.setItemState(node, "selected", true);
    graph.focusItem(node, true);
    node
      .getEdges()
      .forEach((edge) => graph.setItemState(edge, "selected", true));

    // set the selection for the member panel
    setSelection(connection);
  };

  return (
    <Prose>
      <div className="flex items-baseline space-x-2">
        <div className="cursor-help" title={orbitLevelTitle}>
          <OrbitLevelIcon member={member} classes="text-2xl" />
        </div>
        <div className="text-2xl font-semibold">{member.name}</div>
      </div>
      <div className="flex flex-col my-4 space-y-1">
        <div className="flex items-center">
          <span className="w-16 font-bold text-indigo-400">Love</span>
          <Meter
            icon="square"
            number={member.level.number}
            value={member.love}
          ></Meter>
        </div>
        <div className="flex items-center">
          <span className="w-16 font-bold text-indigo-400">Reach</span>
          <Meter
            icon="square"
            number={member.level.number}
            value={member.reach}
          ></Meter>
        </div>
      </div>
      {showNetwork && (
        <>
          <button
            className={buttonClasses}
            onClick={() => {
              setExpanded(false);
              setShowNetwork(false);
            }}
          >
            <FontAwesomeIcon icon="solar-system" className="px-1" />
            <span>View Orbit Level</span>
          </button>
          <div>
            <div className="mb-2 font-bold text-indigo-400">Connections</div>
            <div className="flex flex-wrap">
              {connections.map((connection) => (
                <button
                  className="py-1 w-1/2 text-indigo-100 hover:text-yellow-100"
                  key={connection.id}
                  onClick={() => onConnectionClick(connection)}
                >
                  <div className="flex items-center space-x-1">
                    <OrbitLevelIcon member={connection} classes="" />
                    <span>{connection.name}</span>
                  </div>
                </button>
              ))}
              {connections.length === 0 && <span>None</span>}
            </div>
          </div>
        </>
      )}
      {!showNetwork && (
        <>
          <button
            className={buttonClasses}
            onClick={() => {
              setExpanded(false);
              setShowNetwork(true);
            }}
          >
            <FontAwesomeIcon icon="chart-network" className="px-1" />
            <span>View Connections: {connections.length}</span>
          </button>
          {!member.summary && <div className="py-1" />}
          {member.summary && (
            <div className="leading-tight">
              <span className="font-bold text-indigo-400">Action </span>
              {member.summary}
            </div>
          )}
        </>
      )}
    </Prose>
  );
}
