import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import { Frame, Header, ActivityFeed } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Source({ community, params, api, handlers }) {
  var { source } = params;
  var { onClickChannels } = handlers;

  var feed = new Feed({ community, source });
  var sourceChannels = feed.getSourceChannels({ source });

  var activities = community.activities;
  if (source) {
    activities = activities.filter((activity) => activity.source === source);
  }

  return (
    <Frame>
      {source && (
        <Header>
          {source && <SourceIcon activity={{ source }} />}
          <div>{api.title}</div>
          {sourceChannels.length > 0 && (
            <button
              className="mr-2 text-indigo-700"
              onClick={(e) => onClickChannels(e, source)}
            >
              <FontAwesomeIcon icon="bars" />
            </button>
          )}
        </Header>
      )}
      <ActivityFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
