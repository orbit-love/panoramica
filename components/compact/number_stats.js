import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NumberStats({ member }) {
  return (
    <>
      <div className="flex items-center space-x-1 text-indigo-500">
        <FontAwesomeIcon icon="heart" />
        <span>{member.love}</span>
      </div>
      <div className="flex items-center space-x-1 text-indigo-500">
        <FontAwesomeIcon icon="signal-stream" />
        <span>{member.reach}</span>
      </div>
    </>
  );
}
