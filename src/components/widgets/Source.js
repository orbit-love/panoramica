import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { Frame, Header } from "src/components/widgets";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";

const GET_ACTIVITIES = gql`
  query ($projectId: ID!, $first: Int!, $after: String!) {
    projects(where: { id: $projectId }) {
      activitiesConnection(first: $first, after: $after) {
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

const GET_SOURCE_CHANNELS = gql`
  query ($projectId: ID!, $source: String!) {
    projects(where: { id: $projectId }) {
      sourceChannels(source: $source) {
        name
      }
    }
  }
`;

export default function Source({ project, params, api, handlers }) {
  var { source } = params;
  var { onClickChannels } = handlers;

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
      first,
      after,
    },
  });

  const activities = activitiesConnection.edges.map((edge) => edge.node);

  const {
    data: {
      projects: [{ sourceChannels }],
    },
  } = useSuspenseQuery(GET_SOURCE_CHANNELS, {
    variables: {
      projectId,
      source: source || "no-source",
    },
  });

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{api.title}</div>
        <div className="flex-grow" />
        {sourceChannels.length > 0 && (
          <button className="mr-2" onClick={(e) => onClickChannels(e, source)}>
            <FontAwesomeIcon icon="list" />
          </button>
        )}
      </Header>
      {activities.length}
      {/* <ConversationFeed
        project={project}
        activities={activities}
        community={community}
        handlers={handlers}
        setAfter={setAfter}
        setFirst={setFirst}
      /> */}
    </Frame>
  );
}
