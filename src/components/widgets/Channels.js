import React from "react";

import SourceIcon from "src/components/domains/activity/SourceIcon";
import { Frame, Header } from "src/components/widgets";
import utils from "src/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetSourceChannelsQuery from "./Channels/GetSourceChannels.gql";

export default function Channels({ project, params, handlers }) {
  const [sourceChannels, setSourceChannels] = React.useState([]);
  var { source } = params;
  var { onClickChannel } = handlers;

  const { id: projectId } = project;
  useQuery(GetSourceChannelsQuery, {
    variables: {
      projectId,
      source,
    },
    onCompleted: (data) => {
      const {
        projects: [{ sourceChannels }],
      } = data;
      setSourceChannels(sourceChannels);
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
            {sourceChannels.map(
              ({ name, conversationCount, lastActivityTimestamp }) => (
                <tr
                  key={name}
                  onClick={(e) => onClickChannel(e, source, name)}
                  className="group text-secondary cursor-pointer"
                >
                  <td className="text-right">{conversationCount}</td>
                  <td>
                    <div className="group-hover:underline hover:underline">
                      {utils.displayChannel(name)}
                    </div>
                  </td>
                  <td>{utils.formatDateShort(lastActivityTimestamp)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
