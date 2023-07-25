import React from "react";
import NumberStats from "src/components/domains/member/NumberStats";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function CompactMember({ member, community, metrics, onClick }) {
  const connections = community.findConnections(member) || {};
  return (
    <button onClick={onClick} className="group flex justify-between space-x-1">
      <div className="flex items-center space-x-1">
        <NameAndIcon member={member} onClick={() => {}} />
      </div>
      <div className="mx-auto" />
      {metrics && (
        <NumberStats
          activityCount={member.activityCount}
          connectionCount={Object.keys(connections).length}
        />
      )}
    </button>
  );
}
