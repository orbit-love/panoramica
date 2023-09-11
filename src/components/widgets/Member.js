import React from "react";

import { Frame, Header } from "src/components/widgets";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import Connections from "src/components/domains/member/Connections";
import GetMemberConversationsConnectionQuery from "src/graphql/queries/GetMemberConversationsConnection.gql";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";

export default function Member({ project, params, handlers }) {
  var { member } = params;
  var { onClickConnection } = handlers;

  const { id: memberId } = member;
  const { id: projectId } = project;

  const query = GetMemberConversationsConnectionQuery;
  const variables = {
    projectId,
    memberId,
  };

  const latestActivityByMember = (conversation) => {
    return conversation.descendants
      .reverse()
      .find((a) => a.member.id === member.id);
  };

  const eachConversation = ({ conversation, index }) => (
    <ConversationFeedItem
      project={project}
      index={index}
      key={conversation.id}
      activity={latestActivityByMember(conversation)}
      conversation={conversation}
      handlers={handlers}
    />
  );

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
            eachConversation={eachConversation}
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
          conversationsConnection: { edges, pageInfo },
        },
      ],
    },
  ],
}) => {
  return [edges, pageInfo];
};
