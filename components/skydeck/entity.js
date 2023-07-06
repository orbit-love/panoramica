import React from "react";

import Feed from "lib/community/feed";
import CompactEntity from "components/compact/entity";
import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";

export default function Entity(props) {
  var { entity } = props;
  var feed = new Feed({ entity, ...props });
  var activities = feed.getFilteredActivities();

  return (
    <Frame>
      <Header length={activities.length} {...props}>
        <div className="text-sm">
          <CompactEntity entity={entity} active={false} onClick={() => {}} />
        </div>
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
