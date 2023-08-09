import React from "react";
import NumberStats from "src/components/domains/member/NumberStats";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function CompactMember({ member, metrics, onClick }) {
  return (
    <button onClick={onClick} className="group flex justify-between space-x-1">
      <div className="flex items-center space-x-1">
        <NameAndIcon member={member} onClick={() => {}} />
      </div>
      <div className="mx-auto" />
      {metrics && (
        <NumberStats
          activityCount={member.activitiesAggregate.count}
          connectionCount={0}
        />
      )}
    </button>
  );
}
