import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

export default function Member({ member, members, graph, setSelection }) {
  const connections = members.getConnections({ member });
  // show connections to highest orbit levels first
  connections.sort((a, b) => a.level.number - b.level.number);

  const setSelectionAndFocusItem = (connection) => {
    setSelection(connection);
    const node = graph.findById(connection.id);
    graph.focusItem(node, true);
  };

  return (
    <div className="bg-[#1D1640] text-indigo-100 px-6 py-4 rounded-md border border-indigo-600">
      <div className="flex flex-col space-y-3">
        <div className="flex items-baseline space-x-2">
          <div>
            <OrbitLevelIcon number={member.level.number} classes="text-2xl" />
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: c.orbitLevelColorScale(member.level.number) }}
          >
            {member.name}
          </div>
        </div>
        <div className="flex py-2 px-4 space-x-4 rounded-lg border border-indigo-600">
          <div className="flex items-center space-x-1 text-indigo-400">
            <FontAwesomeIcon icon="heart" />
            <span>{member.love}/3</span>
          </div>
          <div className="flex items-center space-x-1 text-indigo-400">
            <FontAwesomeIcon icon="signal-stream" />
            <span>{member.reach}/3</span>
          </div>
          <div className="flex items-center space-x-1 text-indigo-400">
            <FontAwesomeIcon icon="chart-network" />
            <span>{connections.length}</span>
          </div>
        </div>
        <div className="flex flex-col">
          {connections.map((connection) => (
            <button
              className="p-[1px]"
              key={connection.id}
              onClick={() => setSelectionAndFocusItem(connection)}
            >
              <div className="flex items-center space-x-1 opacity-80 hover:opacity-100">
                <OrbitLevelIcon number={connection.level.number} />
                <span
                  style={{
                    color: c.orbitLevelColorScale(connection.level.number),
                  }}
                >
                  {connection.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
