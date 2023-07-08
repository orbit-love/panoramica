import React from "react";

import Feed from "lib/community/feed";
import CompactEntity from "components/compact/entity";
import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";

export default function Entity({ api, community, handlers, params }) {
  var { entity } = params;
  var feed = new Feed({ entity, community });
  var activities = feed.getFilteredActivities();

  return (
    <Frame>
      <Header api={api} length={activities.length}>
        <div className="text-sm">
          <CompactEntity entity={entity} active={false} onClick={() => {}} />
        </div>
      </Header>
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
