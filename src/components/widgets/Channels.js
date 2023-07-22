import React from "react";

import Feed from "src/models/Feed";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import { Frame, Header } from "src/components/widgets";
import c from "src/configuration/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Channels({ api, community, params, handlers }) {
  var { source } = params;
  var { onClickChannel } = handlers;

  var feed = new Feed({ community });
  var sourceChannels = feed.getSourceChannels({ source });

  var channelMetadatas = sourceChannels
    .map((sourceChannel) => {
      var channelFeed = new Feed({ community, sourceChannel });
      var activities = channelFeed.getFilteredActivities();
      var lastActivity = activities[0]?.timestamp;
      return { count: activities.length, source, sourceChannel, lastActivity };
    })
    .sort((a, b) => {
      var aa = new Date(a.lastActivity);
      var bb = new Date(b.lastActivity);
      return bb - aa;
    });

  return (
    <Frame>
      {source && (
        <Header>
          {source && <SourceIcon activity={{ source }} />}
          <div>{c.titleize(source)}</div>
        </Header>
      )}
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
            {channelMetadatas.map(
              ({ count, source, sourceChannel, lastActivity }, index) => (
                <tr
                  key={sourceChannel}
                  onClick={(e) => onClickChannel(e, source, sourceChannel)}
                  className="group text-secondary cursor-pointer"
                >
                  <td className="text-right">{count}</td>
                  <td>
                    <div className="group-hover:underline hover:underline">
                      {c.displayChannel(sourceChannel)}
                    </div>
                  </td>
                  <td>{c.formatDateShort(lastActivity)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}
