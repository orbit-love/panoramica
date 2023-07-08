import React from "react";

import Feed from "lib/community/feed";
import { Frame, Scroll } from "components/skydeck";
import c from "lib/common";

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
    <Frame api={api}>
      <Scroll>
        <div className="flex flex-col items-start pl-2 px-4 mt-4 text-indigo-400">
          <table className="border-spacing-x-2 table w-full whitespace-nowrap border-separate">
            <tbody>
              <tr className="font-bold">
                <td className="text-right" title="Number of conversations">
                  #
                </td>
                <td>Channel</td>
                <td>Last Active</td>
              </tr>
              {channelMetadatas.map(
                ({ count, source, sourceChannel, lastActivity }, index) => (
                  <tr key={sourceChannel}>
                    <td className="text-right">{count}</td>
                    <td>
                      <button
                        className="text-indigo-100 hover:underline"
                        onClick={(e) =>
                          onClickChannel(e, source, sourceChannel)
                        }
                      >
                        {c.displayChannel(sourceChannel)}
                      </button>
                    </td>
                    <td>{c.formatDateShort(lastActivity)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </Scroll>
    </Frame>
  );
}
