import React from "react";

export default function NameAndIcon({ member, suffix, onClick }) {
  if (!member) {
    return <div>No member!</div>;
  }
  if (!onClick) {
    onClick = (e) => {
      e.stopPropagation();
    };
  }
  return (
    <div
      onClick={(e) => onClick(e, member)}
      className="flex overflow-hidden items-center space-x-1 cursor-pointer"
    >
      <div className="text-primary group-hover:underline overflow-hidden text-ellipsis whitespace-nowrap hover:underline">
        {member.globalActorName || member.globalActor} {suffix}
      </div>
    </div>
  );
}
