import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NumberStats({ member }) {
  return (
    <div className="flex justify-between space-x-2">
      <div className="flex items-center space-x-1 w-12 text-indigo-500">
        <FontAwesomeIcon icon="heart" />
        <span title={member.love}>{member.activityCount}</span>
      </div>
      <div className="flex items-center space-x-1 w-12 text-indigo-500">
        <FontAwesomeIcon icon="signal-stream" />
        <span title={member.reach}>{member.connections.length}</span>
      </div>
    </div>
  );
}
