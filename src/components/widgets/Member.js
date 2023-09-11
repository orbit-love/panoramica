import React from "react";

import { Frame, Header } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import Connections from "src/components/domains/member/Connections";
import GetMemberConversationsConnectionQuery from "src/graphql/queries/GetMemberConversationsConnection.gql";

export default function Member({ project, params, handlers }) {
  var { member } = params;
  var { onClickConnection } = handlers;

  const { globalActor: memberId } = member;
  const { id: projectId } = project;

  const query = GetMemberConversationsConnectionQuery;
  const variables = {
    projectId,
    memberId,
  };

  // what we want instead is to grab all the activities for the member
  // get the conversations, and then render each feed item with the right preview
  // dedupping the conversations
  // this is true for search, etc.

  return (
    <Frame>
      <Header>
        <div className="text-xl">
          <NameAndIcon member={member} onClick={() => {}} />
        </div>
      </Header>
      <div className="flex flex-col space-y-6">
        <Connections
          project={project}
          member={member}
          onClick={(e, member, connection) =>
            onClickConnection(e, member, connection)
          }
        />
        <div>
          <div className="text-tertiary px-6 mb-3 text-lg">Conversations</div>
          <ConversationFeed
            findEdges={findEdges}
            handlers={handlers}
            project={project}
            query={query}
            variables={variables}
            className=""
          />
        </div>
      </div>
    </Frame>
  );
}

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
