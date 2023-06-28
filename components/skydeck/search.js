import React from "react";

import Feed from "lib/community/feed";
import { Frame, Scroll, Header, Activities } from "components/skydeck";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Search(props) {
  var { term, community } = props;

  if (!community?.activities) {
    return <></>;
  }

  var feed = new Feed(props);
  // eventually map the activities back to their threads, dedup, add highlighting
  var activities = feed.activities;
  // push into feed
  if (term) {
    activities = activities.filter(
      (activity) => activity.text.toLowerCase().indexOf(term.toLowerCase()) > -1
    );
  }

  // for performance
  var length = activities.length;

  return (
    <Frame>
      <Header {...props}>
        <FontAwesomeIcon icon="search" />
        <div>{term}</div>
        <div className="text-indigo-500">{length}</div>
      </Header>
      <Scroll>
        <Activities activities={activities} showReplies={true} {...props} />
      </Scroll>
    </Frame>
  );
}
