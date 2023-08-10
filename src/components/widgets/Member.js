import React from "react";

import { Frame, Header } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import CompactConnections from "src/components/domains/member/Connections";
import GetActivitiesQuery from "./Member/GetActivities.gql";

export default function Member({ project, params, handlers }) {
  var { member } = params;
  var { onClickConnection } = handlers;

  const { globalActor: memberId } = member;
  const { id: projectId } = project;

  const query = GetActivitiesQuery;
  const variables = {
    projectId,
    memberId,
  };

  const findEdges = ({
    projects: [
      {
        members: [
          {
            activitiesConnection: { edges, pageInfo },
          },
        ],
      },
    ],
  }) => {
    return [edges, pageInfo];
  };

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
          findEdges={findEdges}
          handlers={handlers}
          project={project}
          query={query}
          variables={variables}
        />
      </div>
    </Frame>
  );
}
