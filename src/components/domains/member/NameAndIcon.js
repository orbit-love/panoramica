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
      <div className="text-primary overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="group-hover:underline font-semibold">
          {member.globalActorName || member.globalActor}
        </span>
        {!hideActor && member.globalActorName && (
          <span className="text-sm text-gray-400 dark:text-gray-600">
            {" "}
            {member.globalActor}
          </span>
        )}
      </div>
    </div>
  );
}
