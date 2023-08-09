import React, { useState } from "react";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { Frame, Header } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import SourceIcon from "src/components/domains/activity/SourceIcon";

const GET_ACTIVITIES = gql`
  query (
    $projectId: ID!
    $first: Int!
    $after: String!
    $source: String!
    $sourceChannel: String!
  ) {
    projects(where: { id: $projectId }) {
      activitiesConnection(
        first: $first
        after: $after
        where: { node: { source: $source, sourceChannel: $sourceChannel } }
      ) {
        edges {
          node {
            id
            source
            timestamp
            text
          }
        }
      }
    }
  }
`;

export default function Channel({ project, params, handlers }) {
  var { source, sourceChannel } = params;

  const [first, setFirst] = useState(10);
  const [after, setAfter] = useState("");

  const { id: projectId } = project;
  const {
    data: {
      projects: [{ activitiesConnection }],
    },
  } = useSuspenseQuery(GET_ACTIVITIES, {
    variables: {
      projectId,
      source,
      sourceChannel,
      first,
      after,
    },
  });

  const activities = activitiesConnection.edges.map((edge) => edge.node);

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{sourceChannel}</div>
      </Header>
      {activities.length}
      {/* <ConversationFeed
        project={project}
        activities={activities}
        community={community}
        handlers={handlers}
      /> */}
    </Frame>
  );
}
