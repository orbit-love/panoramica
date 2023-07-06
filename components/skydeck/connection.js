import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Feed from "lib/community/feed";
import NameAndIcon from "components/compact/name_and_icon";
import Activities from "components/compact/activities";
import { Frame, Scroll, Header } from "components/skydeck";

export default function Connection(props) {
  var { member, connection } = props;

  var feed = new Feed({ selection: member, ...props });
  var activities = feed.getFilteredActivities();

  return (
    <Frame>
      <Header {...props}>
        <NameAndIcon member={member} onClick={() => {}} />
        <FontAwesomeIcon
          icon="right-left"
          className="text-xs text-indigo-600"
        />
        <NameAndIcon member={connection} onClick={() => {}} />
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
