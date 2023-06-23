import React from "react";
import ActivityOrThread from "components/compact/activity_or_thread";
import { addMemberWidget } from "components/skydeck";

export default function Activities({
  title,
  community,
  activities,
  remove,
  addWidget,
  ...props
}) {
  let onClickMember = (member) => {
    addMemberWidget(member, addWidget);
  };
  return (
    <div className="min-w-[375px]">
      {activities?.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <ActivityOrThread
              key={activity.id}
              activity={activity}
              community={community}
              index={index}
              onClickMember={onClickMember}
              {...props}
            />
          ))}
        </>
      )}
    </div>
  );
}
