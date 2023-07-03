import React from "react";
import ActivityOrThread from "components/compact/activity_or_thread";
import {
  addMemberWidget,
  addChannelWidget,
  addEntityWidget,
} from "components/skydeck";

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
  let onClickChannel = (source, sourceChannel) => {
    addChannelWidget(source, sourceChannel, addWidget);
  };
  let onClickEntity = (entity) => {
    addEntityWidget(entity, addWidget);
  };
  // there is a widget index prop at index, so make sure to put this index after
  return (
    <div className="w-[450px]">
      {activities?.length > 0 && (
        <>
          {activities.map((activity, index) => (
            <ActivityOrThread
              key={activity.id}
              activity={activity}
              community={community}
              onClickMember={onClickMember}
              onClickChannel={onClickChannel}
              onClickEntity={onClickEntity}
              {...props}
              index={index}
            />
          ))}
        </>
      )}
    </div>
  );
}
