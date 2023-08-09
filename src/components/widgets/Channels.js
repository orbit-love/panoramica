import React from "react";

import SourceIcon from "src/components/domains/activity/SourceIcon";
import { Frame, Header } from "src/components/widgets";
import utils from "src/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

const GET_SOURCE_CHANNELS = gql`
  query ($projectId: ID!, $source: String!) {
    projects(where: { id: $projectId }) {
      sourceChannels(source: $source) {
        name
        activityCount
        lastActivityAt
      }
    }
  }
`;

export default function Channels({ project, params, handlers }) {
  var { source } = params;
  var { onClickChannel } = handlers;

  const { id: projectId } = project;
  const {
    data: {
      projects: [{ sourceChannels }],
    },
  } = useSuspenseQuery(GET_SOURCE_CHANNELS, {
    variables: {
      projectId,
      source: source,
    },
  });

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{utils.titleize(source)}</div>
      </Header>
      <div className="flex flex-col items-start pl-2 px-6">
        <table className="border-spacing-x-2 table w-full whitespace-nowrap border-separate">
          <tbody>
            <tr className="text-tertiary font-light">
              <td className="text-right" title="Number of conversations">
                <FontAwesomeIcon icon="comment" flip="horizontal" />
              </td>
              <td>Channel</td>
              <td>Last Active</td>
            </tr>
            {sourceChannels.map(({ name, activityCount, lastActivityAt }) => (
              <tr
                key={name}
                onClick={(e) => onClickChannel(e, source, name)}
                className="group text-secondary cursor-pointer"
              >
                <td className="text-right">{activityCount}</td>
                <td>
                  <div className="group-hover:underline hover:underline">
                    {utils.displayChannel(name)}
                  </div>
                </td>
                <td>{utils.formatDateShort(lastActivityAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
