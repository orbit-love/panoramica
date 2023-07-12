import React from "react";

import Feed from "lib/community/feed";
import Activities from "components/compact/activities";
import { Frame, Scroll } from "components/skydeck";

export default function Channel({ api, community, params, handlers }) {
  var { source, sourceChannel } = params;

  var feed = new Feed({ community, source, sourceChannel });
  var activities = feed.getFilteredActivities();

  // for performance
  activities = activities.slice(0, 50);

  return (
    <Frame>
      <Scroll>
        <Activities
          activities={activities}
          community={community}
          handlers={handlers}
        />
      </Scroll>
    </Frame>
  );
}
