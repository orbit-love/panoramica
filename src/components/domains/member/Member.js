import React from "react";
import NumberStats from "src/components/domains/member/NumberStats";
import NameAndIcon from "src/components/domains/member/NameAndIcon";

export default function CompactMember({
  member,
  metrics,
  conversationCount,
  connectionCount,
  onClick,
}) {
  return (
    <button onClick={onClick} className="group flex justify-between space-x-1">
      <div className="flex overflow-hidden items-center space-x-1">
        <NameAndIcon member={member} onClick={() => {}} />
      </div>
      <div className="mx-auto" />
      {metrics && (
        <NumberStats
          conversationCount={conversationCount}
          connectionCount={connectionCount}
        />
      )}
    </button>
  );
}
