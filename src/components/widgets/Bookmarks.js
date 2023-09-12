import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { BookmarksContext } from "src/components/context/BookmarksContext";
import { Frame, Header } from "src/components/widgets";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";

export default function Bookmarks({ project, api, handlers }) {
  var { bookmarks } = useContext(BookmarksContext);
  bookmarks = bookmarks.sort((a, b) => b.createdAtInt - a.createdAtInt);

  return (
    <Frame>
      <Header>
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon="bookmark" />
          <div>{api.title}</div>
        </div>
        <div className="flex-grow" />
        <div>{bookmarks.length}</div>
      </Header>
      {bookmarks.map(({ node: activity }) => (
        <ConversationFeedItem
          key={activity.id}
          activity={activity}
          conversation={activity}
          project={project}
          handlers={handlers}
        />
      ))}
    </Frame>
  );
}
