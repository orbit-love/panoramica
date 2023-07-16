import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import NameAndIcon from "components/compact/name_and_icon";
import { Frame, Header, ActivityFeed } from "components/skydeck";

export default function Connection({ api, params, community, handlers }) {
  var { member, connection } = params;
  var { onClickMember } = handlers;

  // the intention here is to grab activities that are in threads
  // with both members and where either is the actor; this ensures the activity
  // used to display the conversation is from either member
  var activities = community.activities.filter((activity) => {
    var { members } = community.threads[activity.conversationId];
    var threadIsKeepable =
      members.indexOf(member.globalActor) > -1 &&
      members.indexOf(connection.globalActor) > -1;
    var activityIsKeepable =
      activity.globalActor === member.globalActor ||
      activity.globalActor === connection.globalActor;
    return threadIsKeepable && activityIsKeepable;
  });

  return (
    <Frame>
      <Header>
        <NameAndIcon member={member} onClick={onClickMember} />
        <FontAwesomeIcon
          icon="right-left"
          className="text-xs text-indigo-700"
        />
        <NameAndIcon member={connection} onClick={onClickMember} />
      </Header>
      <ActivityFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
