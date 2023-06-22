import React from "react";

import Feed from "lib/community/feed";
import { Frame, Scroll, Header, Activities } from "components/skydeck";

export default function Entity(props) {
  var { entity } = props;
  var feed = new Feed({ entity, ...props });
  var activities = feed.getFilteredActivities();

  return (
    <Frame>
      <Header length={activities.length} {...props}>
        <span>{entity.id}</span>
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
