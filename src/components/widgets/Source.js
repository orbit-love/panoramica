import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { Frame, Header } from "src/components/widgets";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";

const GET_ACTIVITIES = gql`
  query ($projectId: ID!, $first: Int!, $after: Cursor) {
    project(id: $projectId) {
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

export default function Source({ project, params, api, handlers }) {
  var { source } = params;
  // var { onClickChannels } = handlers;
  // var sourceChannels = community.getSourceChannels({ source });

  // var activities = community.activities;
  // if (source) {
  //   activities = activities.filter((activity) => activity.source === source);
  // }
  //
  const [first, setFirst] = useState(10);
  const [after, setAfter] = useState(0);
  const { id: projectId } = project;

  const { data } = useSuspenseQuery(GET_ACTIVITIES, {
    variables: {
      projectId,
      first,
      after,
    },
  });

  const activities =
    data?.project?.activitiesConnection?.edges?.map((edge) => edge.node) || [];

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{api.title}</div>
        <div className="flex-grow" />
        {/* {sourceChannels.length > 0 && (
          <button className="mr-2" onClick={(e) => onClickChannels(e, source)}>
            <FontAwesomeIcon icon="list" />
          </button>
        )} */}
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
