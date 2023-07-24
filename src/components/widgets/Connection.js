import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Frame, Header } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";

export default function Connection({ params, community, handlers }) {
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
        <div className="flex items-center space-x-2 text-lg">
          <NameAndIcon member={member} onClick={onClickMember} />
          <FontAwesomeIcon
            icon="right-left"
            className="text-secondary text-sm"
          />
          <NameAndIcon member={connection} onClick={onClickMember} />
        </div>
      </Header>
      <ConversationFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
