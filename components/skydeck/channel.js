import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";
import c from "lib/common";

export default function Channel(props) {
  var { source, sourceChannel, community } = props;

  var feed = new Feed(props);
  var activities = feed.getFilteredActivities();

  // for performance
  var length = activities.length;
  activities = activities.slice(0, 50);

  var title = c.displayChannel(sourceChannel);

  return (
    <Frame>
      <Header {...props}>
        {<SourceIcon activity={{ source }} />}
        <div>{title}</div>
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
