import React from "react";

import CompactEntity from "components/compact/entity";
import { Frame, Header, ActivityFeed } from "components/skydeck";

export default function Entity({ community, handlers, params }) {
  var { entity } = params;

  var activities = community.activities.filter(
    (activity) => activity.entities.indexOf(entity.id) > -1
  );

  return (
    <Frame>
      <Header>
        <div className="text-xs">
          <CompactEntity entity={entity} active={false} onClick={() => {}} />
        </div>
      </Header>
      <ActivityFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
