import React, { useState, useContext } from "react";
import classnames from "classnames";

import { BookmarksContext } from "src/components/context/BookmarksContext";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import Toolbar from "src/components/domains/conversation/Toolbar";

export default function ConversationFeedItem(props) {
  var { index, activity, handlers, term } = props;

  const bookmarksContext = useContext(BookmarksContext);
  const bookmarks = bookmarksContext.bookmarks;

  const conversation = activity.conversation;
  const bookmark = bookmarks.find(
    (bookmark) => bookmark.node.id === conversation.id
  );

  const defaultExpanded = conversation.descendants.length === 1;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const canExpand = conversation.descendants.length > 1;

  const onOpen = (e) => {
    handlers.onClickActivity(e, conversation);
  };

  const onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className={classnames(
        "group/menu flex flex-col px-6 relative border-b border-b-gray-300 dark:border-b-gray-700",
        {
          "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
            index % 2 === 0,
          "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
            index % 2 === 1,
          "border-l-2 border-tertiary": !!bookmark,
        }
      )}
    >
      {expanded && (
        <div className="py-6">
          <FullThreadView
            {...props}
            activity={activity}
            conversation={conversation}
            term={term}
          />
        </div>
      )}
      {!expanded && <PreviewView onExpand={onExpand} {...props} />}
      <Toolbar
        {...props}
        activity={conversation}
        canExpand={canExpand}
        expanded={expanded}
        setExpanded={setExpanded}
        onOpen={onOpen}
        onExpand={onExpand}
        bookmark={bookmark}
      />
    </div>
  );
}
