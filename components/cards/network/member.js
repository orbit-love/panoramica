import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";
import CompactMember from "components/compact/member";
import MemberStats from "components/compact/member_stats";

export default function Member({
  member,
  graph,
  setSelection,
  setShowNetwork,
}) {
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
            <button
              onClick={() => {
                setShowNetwork(false);
                setSelection(member.level);
              }}
            >
              <OrbitLevelIcon number={member.level.number} classes="text-2xl" />
            </button>
          </div>
          <div
            className="text-2xl font-semibold"
            style={{ color: c.orbitLevelColorScale(member.level.number) }}
          >
            {member.name}
          </div>
        </div>
        <div className="flex py-2 px-4 space-x-4 rounded-lg border border-indigo-600">
          <MemberStats member={member} />
        </div>
        <div className="flex flex-col">
          {member.connections.map((connection) => (
            <CompactMember
              key={connection.id}
              member={connection}
              setSelection={setSelectionAndFocusItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
