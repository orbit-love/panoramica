import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Feed from "lib/community/feed";
import NameAndIcon from "components/compact/name_and_icon";
import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";

export default function Connection({ api, params, community, handlers }) {
  var { member, connection } = params;

  var feed = new Feed({ member, connection, community });
  var activities = feed.getFilteredActivities();

  return (
    <Frame api={api}>
      <Header>
        <NameAndIcon member={member} onClick={() => {}} />
        <FontAwesomeIcon
          icon="right-left"
          className="text-xs text-indigo-700"
        />
        <NameAndIcon member={connection} onClick={() => {}} />
      </Header>
      <Scroll>
        <Activities
          activities={activities}
          community={community}
          handlers={handlers}
        />
      </Scroll>
    </Frame>
  );
}
