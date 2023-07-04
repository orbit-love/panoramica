import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import { Frame, Scroll, Header } from "components/skydeck";
import c from "lib/common";

export default function Channels(props) {
  var { source, onClickChannel } = props;

  var feed = new Feed(props);
  var sourceChannels = feed.getSourceChannels({ source }).sort(c.sortChannels);

  var channelMetadatas = sourceChannels.map((sourceChannel) => {
    var channelFeed = new Feed({ ...props, sourceChannel });
    var activities = channelFeed.getFilteredActivities();
    var lastActivity = activities[0]?.timestamp;
    return { count: activities.length, lastActivity };
  });

  var title = `Channels`;

  return (
    <Frame>
      <Header {...props}>
        {source && <SourceIcon activity={{ source }} />}
        <div>{title}</div>
        <div className="text-indigo-500">{sourceChannels.length}</div>
      </Header>
      <Scroll>
        <div className="flex flex-col items-start pl-2 px-4 text-sm text-indigo-400">
          <table className="border-spacing-x-2 border-spacing-y-1 table w-full whitespace-nowrap border-separate">
            <tbody>
              <tr className="font-bold">
                <td className="text-right">#</td>
                <td>Channel</td>
                <td>Last Active</td>
              </tr>
              {sourceChannels.map((channel, index) => (
                <tr key={channel}>
                  <td className="text-right">
                    {channelMetadatas[index].count}
                  </td>
                  <td>
                    <button
                      className="text-indigo-100 hover:underline"
                      onClick={() => onClickChannel(source, channel)}
                    >
                      {c.displayChannel(channel)}
                    </button>
                  </td>
                  <td>
                    {c.formatDateShort(channelMetadatas[index].lastActivity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Scroll>
    </Frame>
  );
}
