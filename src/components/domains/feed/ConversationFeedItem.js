import React, { useState, useCallback, useContext } from "react";
import classnames from "classnames";

import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import Toolbar from "src/components/domains/conversation/Toolbar";
import {
  postCreateBookmark,
  deleteBookmark,
} from "src/data/client/fetches/bookmarks";

export default function ConversationFeedItem(props) {
  var { index, project, activity, community, handlers } = props;

  const { bookmarks } = useContext(BookmarksContext);
  const dispatch = useContext(BookmarksDispatchContext);

  var [expanded, setExpanded] = useState(false);

  var conversationActivity = community.findActivityById(
    activity.conversationId
  );

  var conversation = community.conversations[conversationActivity.id];
  var canExpand = conversation?.children?.length > 0;

  var bookmark = bookmarks?.find(
    (bookmark) => bookmark.activityId === conversationActivity.id
  );

  var onOpen = (e) => {
    handlers.onClickActivity(e, conversationActivity);
  };

  var onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  const onBookmark = useCallback(() => {
    if (bookmark) {
      deleteBookmark({
        project,
        activity: conversationActivity,
        onSuccess: () => {
          dispatch({
            type: "removeBookmark",
            bookmark,
          });
        },
      });
    } else {
      postCreateBookmark({
        project,
        activity: conversationActivity,
        onSuccess: ({ result }) => {
          const { bookmark } = result;
          dispatch({
            type: "addBookmark",
            bookmark,
          });
        },
      });
    }
  }, [project, dispatch, bookmark, conversationActivity]);

  return (
    <div
      className={classnames(
        "group/menu flex flex-col py-6 px-6 relative border-b border-gray-300 dark:border-gray-700",
        {
          "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
            index % 2 === 0,
          "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
            index % 2 === 1,
        }
      )}
    >
      {expanded && (
        <FullThreadView {...props} activity={conversationActivity} />
      )}
      {!expanded && <PreviewView onExpand={onExpand} {...props} />}
      <Toolbar
        {...props}
        canExpand={canExpand}
        expanded={expanded}
        setExpanded={setExpanded}
        onOpen={onOpen}
        onExpand={onExpand}
        bookmark={bookmark}
        onBookmark={onBookmark}
      />
    </div>
  );
}
