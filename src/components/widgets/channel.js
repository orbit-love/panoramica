import React from "react";
import { Frame, ActivityFeed } from "components/skydeck";

export default function Channel({ community, params, handlers }) {
  var { source, sourceChannel } = params;

  var activities = community.activities.filter(
    (activity) =>
      activity.source === source && activity.sourceChannel === sourceChannel
  );

  return (
    <Frame>
      <ActivityFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
