import React from "react";

export default function NameAndIcon({ member, hideActor, onClick }) {
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
      <div className="overflow-hidden text-gray-400 text-ellipsis whitespace-nowrap dark:text-gray-600">
        <span className="text-primary group-hover:underline font-semibold">
          {member.globalActorName || member.globalActor}
        </span>
        {!hideActor && member.globalActorName && (
          <span className="text-sm"> {member.globalActor}</span>
        )}
      </div>
    </div>
  );
}
