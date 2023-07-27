import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NumberStats({ activityCount, connectionCount }) {
  return (
    <div className="flex space-x-2">
      <div className="text-secondary flex justify-end items-center space-x-1 w-12">
        <FontAwesomeIcon icon="comment" flip="horizontal" className="text-sm" />
        <span>{activityCount}</span>
      </div>
      <div className="text-secondary flex justify-end items-center space-x-1 w-12">
        <FontAwesomeIcon icon="right-left" className="text-sm" />
        <span>{connectionCount}</span>
      </div>
    </div>
  );
}
