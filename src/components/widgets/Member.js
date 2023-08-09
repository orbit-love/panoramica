import React, { useState } from "react";

import { Frame, Header } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import CompactConnections from "src/components/domains/member/Connections";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetActivitiesQuery from "./Member/GetActivities.gql";

export default function Member({ project, params, handlers }) {
  var { member } = params;
  var { onClickConnection } = handlers;

  const [first, setFirst] = useState(10);
  const [after, setAfter] = useState("");

  const { globalActor: memberId } = member;
  const { id: projectId } = project;
  const {
    data: {
      projects: [
        {
          members: [{ activitiesConnection }],
        },
      ],
    },
  } = useSuspenseQuery(GetActivitiesQuery, {
    variables: {
      projectId,
      memberId,
      first,
      after,
    },
  });

  const activities = activitiesConnection.edges.map((edge) => edge.node);

  return (
    <Frame>
      <Header>
        <div className="text-lg">
          <NameAndIcon member={member} onClick={() => {}} />
        </div>
      </Header>
      <div className="flex flex-col space-y-3">
        {/* <CompactConnections
          member={member}
          community={community}
          onClick={(e, member, connection) =>
            onClickConnection(e, member, connection)
          }
        /> */}
        <ConversationFeed
          project={project}
          activities={activities}
          handlers={handlers}
          first={first}
          after={after}
          setFirst={setFirst}
          setAfter={setAfter}
        />
      </div>
    </Frame>
  );
}
