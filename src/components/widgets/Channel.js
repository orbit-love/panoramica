import React from "react";
import { Frame, Header } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import GetConversationsConnectionQuery from "src/graphql/queries/GetConversationsConnection.gql";

export default function Channel({ project, params, handlers }) {
  var { source, sourceChannel } = params;

  const { id: projectId } = project;
  const where = { AND: [{ node: { source, sourceChannel } }] };
  const query = GetConversationsConnectionQuery;
  const variables = {
    projectId,
  };

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{sourceChannel}</div>
      </Header>
      <ConversationFeed
        handlers={handlers}
        project={project}
        query={query}
        variables={variables}
        where={where}
      />
    </Frame>
  );
}
