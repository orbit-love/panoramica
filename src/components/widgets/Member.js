import React from "react";

import NameAndIcon from "src/components/domains/member/NameAndIcon";
import { Frame, Header, ActivityFeed } from "src/components/widgets";
import CompactConnections from "src/components/domains/member/Connections";

export default function Member({ community, params, handlers }) {
  var { member } = params;
  var { onClickConnection } = handlers;

  // for each thread, render the latest activity that involves the member
  // as a starting point for exploring the thread
  var activities = community.activities.filter(
    (activity) => activity.globalActor === member.globalActor
  );

  return (
    <Frame>
      <Header>
        <div className="text-lg">
          <NameAndIcon member={member} onClick={() => {}} />
        </div>
      </Header>
      <div className="flex flex-col space-y-3">
        <CompactConnections
          member={member}
          community={community}
          onClick={(e, member, connection) =>
            onClickConnection(e, member, connection)
          }
        />
        <ActivityFeed
          activities={activities}
          community={community}
          handlers={handlers}
        />
      </div>
    </Frame>
  );
}
