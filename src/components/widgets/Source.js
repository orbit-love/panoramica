import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Frame, Header } from "src/components/widgets";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";

export default function Source({ project, community, params, api, handlers }) {
  var { source } = params;
  var { onClickChannels } = handlers;

  var sourceChannels = community.getSourceChannels({ source });

  var activities = community.activities;
  if (source) {
    activities = activities.filter((activity) => activity.source === source);
  }

  return (
    <Frame>
      <Header>
        {source && <SourceIcon activity={{ source }} />}
        <div>{api.title}</div>
        <div className="flex-grow" />
        {sourceChannels.length > 0 && (
          <button className="mr-2" onClick={(e) => onClickChannels(e, source)}>
            <FontAwesomeIcon icon="list" />
          </button>
        )}
      </Header>
      <ConversationFeed
        project={project}
        activities={activities}
        community={community}
        handlers={handlers}
      />
    </Frame>
  );
}
