import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import { Frame, Scroll, Header, Activities } from "components/skydeck";
import c from "lib/common";

export default function Channel(props) {
  var { source, sourceChannel, community } = props;

  if (!community?.activities) {
    return <></>;
  }

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
        <div className="text-indigo-500">{length}</div>
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
