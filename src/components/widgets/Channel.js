import React from "react";
import { Frame, Header } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import GetActivitiesQuery from "./Channel/GetActivities.gql";

export default function Channel({ project, params, handlers }) {
  var { source, sourceChannel } = params;

  const { id: projectId } = project;
  const query = GetActivitiesQuery;
  const variables = {
    projectId,
    source,
    sourceChannel,
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
      />
    </Frame>
  );
}
