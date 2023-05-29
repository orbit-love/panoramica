import React from "react";
import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function MemberStats({ member }) {
  const love = c.scale123(member.love);
  const reach = c.scale123(member.reach);
  return (
    <>
      <div className="flex items-center space-x-1 text-indigo-400">
        <FontAwesomeIcon icon="heart" />
        <span>{love}/3</span>
      </div>
      <div className="flex items-center space-x-1 text-indigo-400">
        <FontAwesomeIcon icon="signal-stream" />
        <span>{reach}/3</span>
      </div>
      <div className="flex items-center space-x-1 text-indigo-400">
        <FontAwesomeIcon icon="chart-network" />
        <span>{member.connections.length}</span>
      </div>
    </>
  );
}
