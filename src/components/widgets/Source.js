import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { Frame, Header } from "src/components/widgets";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import GetActivitiesQuery from "./Source/GetActivities.gql";
import GetActivitiesWithSourceQuery from "./Source/GetActivitiesWithSource.gql";
import GetSourceChannelsQuery from "./Source/GetSourceChannels.gql";

export default function Source({ project, params, api, handlers }) {
  var { source } = params;
  var { onClickChannels } = handlers;

  const { id: projectId } = project;
  const query = source ? GetActivitiesWithSourceQuery : GetActivitiesQuery;
  const variables = {
    projectId,
    ...(source && { source }),
  };

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{api.title}</div>
        <div className="flex-grow" />
        <React.Suspense fallback={<div />}>
          <SourceChannelsHeader
            project={project}
            source={source}
            onClickChannels={onClickChannels}
          />
        </React.Suspense>
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

const SourceChannelsHeader = ({ project, source, onClickChannels }) => {
  const { id: projectId } = project;
  const {
    data: {
      projects: [{ sourceChannels }],
    },
  } = useSuspenseQuery(GetSourceChannelsQuery, {
    variables: {
      projectId,
      source: source || "no-source",
    },
  });
  return (
    <>
      {sourceChannels.length > 0 && (
        <button className="mr-2" onClick={(e) => onClickChannels(e, source)}>
          <FontAwesomeIcon icon="list" />
        </button>
      )}
    </>
  );
};
