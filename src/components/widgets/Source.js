import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { Frame, Header } from "src/components/widgets";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";
import GetActivitiesQuery from "./Source/GetActivities.gql";
import GetActivitiesWithSourceQuery from "./Source/GetActivitiesWithSource.gql";
import GetSourceChannelsQuery from "./Source/GetSourceChannels.gql";
import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";

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
      <React.Suspense fallback={<div />}>
        <Filters project={project} source={source} />
      </React.Suspense>
      <ConversationFeed
        handlers={handlers}
        project={project}
        query={query}
        variables={variables}
      />
    </Frame>
  );
}

const Filters = ({ project, source }) => {
  const propertyNames = ["type"];
  const { id: projectId } = project;
  const {
    data: {
      projects: [{ propertyFilters }],
    },
  } = useSuspenseQuery(GetPropertyFiltersQuery, {
    variables: {
      projectId,
      propertyNames,
      source,
    },
  });

  return (
    <div className="flex space-x-2">
      {propertyFilters.map(({ name, values }) => {
        return (
          <div key={name} className="flex flex-col px-6 mb-4 space-y-1 text-sm">
            <div className="font-bold">{name}</div>
            <div className="flex flex-col">
              {values.map(({ value, count }) => {
                return (
                  <div key={value} className="flex space-x-1">
                    <div className="text-sm">{value}</div>
                    <div className="text-sm text-gray-500">({count})</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
