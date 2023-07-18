import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NumberStats({ member }) {
  return (
    <div className="flex space-x-2">
      <div className="flex justify-end items-center space-x-1 w-12 text-indigo-500">
        <FontAwesomeIcon icon="comment" flip="horizontal" className="text-sm" />
        <span>{member.activityCount}</span>
      </div>
      <div className="flex justify-end items-center space-x-1 w-12 text-indigo-500">
        <FontAwesomeIcon icon="right-left" className="text-sm" />
        <span>{member.connectionCount}</span>
      </div>
    </div>
  );
}
