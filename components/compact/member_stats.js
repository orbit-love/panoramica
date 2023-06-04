import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Meter from "components/meter";

export default function MemberStats({ member }) {
  return (
    <>
      <div className="flex items-center space-x-1 text-indigo-500">
        <FontAwesomeIcon icon="heart" />
        <Meter number={member.level} value={member.love} relative />
      </div>
      <div className="flex items-center space-x-1 text-indigo-500">
        <FontAwesomeIcon icon="signal-stream" />
        <Meter number={member.level} value={member.reach} relative />
      </div>
    </>
  );
}
