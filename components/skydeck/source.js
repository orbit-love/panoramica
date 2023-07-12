import React from "react";

import Feed from "lib/community/feed";
import SourceIcon from "components/compact/source_icon";
import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";
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

  // only show the most recent reply in any conversation
  var conversationIds = activities.map((a) => a.conversationId);
  activities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  var onClickActivity = (e, activity) => {
    var conversation = community.findActivityById(activity.conversationId);
    handlers.onClickActivity(e, conversation);
  };

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
      <Activities
        activities={activities}
        community={community}
        handlers={{ ...handlers, onClickActivity }}
        hideNoActivities
        maxDepth={0}
      />
    </Frame>
  );
}
