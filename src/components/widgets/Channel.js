import React from "react";
import { Frame, Header } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import c from "src/configuration/common";

export default function Channel({ community, params, handlers }) {
  var { source, sourceChannel } = params;

  var activities = community.activities.filter(
    (activity) =>
      activity.source === source && activity.sourceChannel === sourceChannel
  );

  return (
    <Frame>
      {source && (
        <Header>
          {source && <SourceIcon activity={{ source }} />}
          <div>{c.displayChannel(sourceChannel)}</div>
        </Header>
      )}
      <ConversationFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
