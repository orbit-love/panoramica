import React, { useCallback, useContext } from "react";
import { useMutation } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import ConnectBookmarkMutation from "src/graphql/mutations/ConnectBookmark.gql";
import DisconnectBookmarkMutation from "src/graphql/mutations/DisconnectBookmark.gql";

export default function BookmarkAction({ activity, className }) {
  const { bookmarks } = useContext(BookmarksContext);
  const dispatch = useContext(BookmarksDispatchContext);

  var bookmark = bookmarks.find((bookmark) => bookmark.node.id === activity.id);

  const bookmarkIcon = bookmark ? "bookmark" : ["far", "bookmark"];

  const [connectBookmark] = useMutation(ConnectBookmarkMutation);
  const [disconnectBookmark] = useMutation(DisconnectBookmarkMutation);

  const onBookmark = useCallback(async () => {
    const { id: activityId } = activity;
    if (bookmark) {
      await disconnectBookmark({
        variables: {
          activityId,
        },
      });
      dispatch({
        type: "removeBookmark",
        bookmark,
      });
    } else {
      const createdAt = new Date();
      const createdAtInt = Date.parse(createdAt);
      const {
        data: {
          updateUsers: {
            users: [
              {
                bookmarksConnection: {
                  edges: [bookmark],
                },
              },
            ],
          },
        },
      } = await connectBookmark({
        variables: {
          activityId,
          createdAt,
          createdAtInt,
        },
      });
      dispatch({
        type: "addBookmark",
        bookmark,
      });
    }
  }, [dispatch, bookmark, activity, connectBookmark, disconnectBookmark]);

  return (
    <button
      title="Bookmark conversation"
      onClick={onBookmark}
      className={className}
    >
      <FontAwesomeIcon icon={bookmarkIcon} />
    </button>
  );
}
