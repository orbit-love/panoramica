import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { BookmarksContext } from "src/components/context/BookmarksContext";
import { Frame, Header } from "src/components/widgets";
import ConversationFeed from "src/components/domains/feed/ConversationFeed";

export default function Bookmarks({ project, community, api, handlers }) {
  const { bookmarks } = useContext(BookmarksContext);

  const activities = bookmarks.map((bookmark) =>
    community.findActivityById(bookmark.activityId)
  );

  return (
    <Frame>
      <Header>
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon="bookmark" />
          <div>{api.title}</div>
        </div>
        <div className="flex-grow" />
        <div>{activities?.length}</div>
      </Header>
      {activities && (
        <ConversationFeed
          project={project}
          activities={activities}
          community={community}
          handlers={handlers}
        />
      )}
    </Frame>
  );
}
