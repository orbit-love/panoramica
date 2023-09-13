import React, { useState, useContext } from "react";
import classnames from "classnames";

import { BookmarksContext } from "src/components/context/BookmarksContext";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import Toolbar from "src/components/domains/conversation/Toolbar";
import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";

// activity is passed in also and passed through; it is up to the caller to
// pass in the conversation, whether it is the activity or an ancestor
export default function ConversationFeedItem(props) {
  var { index, conversation, handlers } = props;

  const bookmarksContext = useContext(BookmarksContext);
  const bookmarks = bookmarksContext.bookmarks;

  // this pattern assumes that the activity passed in is the conversation
  // (the top level activity) and contains descendants
  const bookmark = bookmarks.find(
    (bookmark) => bookmark.node.id === conversation.id
  );

  const defaultExpanded = conversation.descendants.length === 1;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const canExpand = conversation.descendants.length > 1;

  const onOpen = (e) => {
    handlers.onClickConversation(e, conversation);
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
        "group/menu flex flex-col relative border-b border-b-gray-300 dark:border-b-gray-700",
        {
          "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
            index % 2 === 1,
          "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
            index % 2 === 0,
          "border-l-2 border-tertiary": !!bookmark,
        }
      )}
    >
      <ErrorBoundary
        fallback={
          <div className="p-4 text-red-500">
            Error! Conversation: {conversation.id}
          </div>
        }
      >
        {expanded && <FullThreadView {...props} conversation={conversation} />}
        {!expanded && (
          <PreviewView
            {...props}
            onExpand={onExpand}
            conversation={conversation}
          />
        )}
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
      </ErrorBoundary>
    </div>
  );
}
