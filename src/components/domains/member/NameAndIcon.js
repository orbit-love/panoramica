import React from "react";

export default function NameAndIcon({ member, onClick, noColor }) {
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
      <div className="overflow-hidden font-light text-rose-400 text-ellipsis whitespace-nowrap hover:underline">
        {member.globalActorName || member.actorName}
      </div>
    </div>
  );
}
