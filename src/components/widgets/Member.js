import React from "react";

import NameAndIcon from "src/components/domains/member/NameAndIcon";
import { Frame, Header, ActivityFeed } from "src/components/widgets";
import CompactConnections from "src/components/domains/member/Connections";

export default function Member({ community, params, handlers }) {
  var { member } = params;
  var { onClickConnection } = handlers;

  // this will allow the feed to render the latest activity by this
  // member in each thread, preventing other thread noise from
  // obscuring how the member was involved
  var activities = community.activities.filter(
    (activity) => activity.globalActor === member.globalActor
  );

  // an alternative would be only showing their activities and linking to conversations
  // or showing a conversation summary view; what is nice is to see the members / topics
  // var activities = community.activities.filter(activity => activity.globalActor === member.globalActor);

  return (
    <Frame>
      <Header>
        <div className="text-lg">
          <NameAndIcon member={member} onClick={() => {}} />
        </div>
      </Header>
      <div className="flex flex-col space-y-3">
        {member.connectionCount > 0 && (
          <>
            <div className="flex flex-col px-4">
              <CompactConnections
                member={member}
                community={community}
                onClick={(e, member, connection) =>
                  onClickConnection(e, member, connection)
                }
              />
            </div>
          </>
        )}
        <ActivityFeed
          activities={activities}
          community={community}
          handlers={handlers}
        />
      </div>
    </Frame>
  );
}
