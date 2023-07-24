import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Feed from "src/models/Feed";
import { Frame, Header } from "src/components/widgets";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";

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
          <div className="flex-grow" />
          {sourceChannels.length > 0 && (
            <button
              className="mr-2"
              onClick={(e) => onClickChannels(e, source)}
            >
              <FontAwesomeIcon icon="list" />
            </button>
          )}
        </Header>
      )}
      <ConversationFeed
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
