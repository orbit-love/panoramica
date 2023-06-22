import React from "react";

import Feed from "lib/community/feed";
import NameAndIcon from "components/compact/name_and_icon";
import { Frame, Scroll, Header, Activities } from "components/skydeck";

export default function Member(props) {
  var { member } = props;
  var feed = new Feed({ selection: member, ...props });
  var activities = feed.getFilteredActivities();

  return (
    <Frame>
      <Header length={activities.length} {...props}>
        <NameAndIcon member={member} onClick={() => {}} />
      </Header>
      <Scroll>
        <Activities activities={activities} {...props} />
      </Scroll>
    </Frame>
  );
}
