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
  var activities = feed.getFilteredActivities();
  var sourceChannels = feed.getSourceChannels({ source });

  return (
    <Frame api={api}>
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
        handlers={handlers}
      />
    </Frame>
  );
}
