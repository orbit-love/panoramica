import React from "react";
import { Frame, Header, ActivityFeed } from "src/components/widgets";
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
      <ActivityFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
