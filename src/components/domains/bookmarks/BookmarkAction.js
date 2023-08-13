import React, { useCallback, useContext } from "react";
import { useMutation } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import CreateBookmarkMutation from "src/graphql/mutations/CreateBookmark.gql";
import DeleteBookmarkMutation from "src/graphql/mutations/DeleteBookmark.gql";

export default function BookmarkAction({ activity, className }) {
  const { bookmarks } = useContext(BookmarksContext);
  const dispatch = useContext(BookmarksDispatchContext);

  var bookmark = bookmarks.find((bookmark) => bookmark.node.id === activity.id);

  const bookmarkIcon = bookmark ? "bookmark" : ["far", "bookmark"];

  const [createBookmark] = useMutation(CreateBookmarkMutation);
  const [deleteBookmark] = useMutation(DeleteBookmarkMutation);

  const onBookmark = useCallback(async () => {
    const { id: activityId } = activity;
    if (bookmark) {
      await deleteBookmark({
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
      } = await createBookmark({
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
  }, [dispatch, bookmark, activity, createBookmark, deleteBookmark]);

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
