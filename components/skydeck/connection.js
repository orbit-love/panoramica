import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Feed from "lib/community/feed";
import NameAndIcon from "components/compact/name_and_icon";
import { Frame, Scroll, Header, Activities } from "components/skydeck";

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
        <div className="text-indigo-500">{activities.length}</div>
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
