import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import {
  Frame,
  Scroll,
  Header,
  Channels,
  Activities,
} from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Source(props) {
  var { source, community, title, addWidget } = props;

  if (!community?.activities) {
    return <></>;
  }

  var feed = new Feed(props);
  var activities = feed.getFilteredActivities();
  var sourceChannels = feed.getSourceChannels({ source });

  // for performance
  var length = activities.length;
  activities = activities.slice(0, 50);

  const addChannelsWidget = () =>
    addWidget((props) => <Channels source={source} {...props} />);

  return (
    <Frame>
      <Header {...props}>
        {source && <SourceIcon activity={{ source }} />}
        <div>{title}</div>
        <div className="text-indigo-500">{length}</div>
        {sourceChannels.length > 0 && (
          <button className="mr-2 text-indigo-700" onClick={addChannelsWidget}>
            <FontAwesomeIcon icon="bars" />
          </button>
        )}
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
