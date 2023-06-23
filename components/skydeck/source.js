import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import { Frame, Scroll, Header, Activities } from "components/skydeck";

export default function Source(props) {
  var { source, community, title } = props;

  if (!community?.activities) {
    return <></>;
  }

  var feed = new Feed(props);
  var activities = feed.getFilteredActivities();
  if (source) {
    activities = activities.filter(
      (activity) => !source || source === activity.source
    );
  }

  // for performance
  var length = activities.length;
  activities = activities.slice(0, 50);

  return (
    <Frame>
      <Header {...props}>
        {source && <SourceIcon activity={{ source }} />}
        <div>{title}</div>
        <div className="text-indigo-500">{length}</div>
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
