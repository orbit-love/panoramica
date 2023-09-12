import React, { useCallback, useContext } from "react";
import classnames from "classnames";
import { useMutation } from "@apollo/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "next-auth/react";

import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import ConnectBookmarkMutation from "src/graphql/mutations/ConnectBookmark.gql";
import DisconnectBookmarkMutation from "src/graphql/mutations/DisconnectBookmark.gql";

export default function BookmarkAction({ conversation, className }) {
  const { bookmarks } = useContext(BookmarksContext);
  const dispatch = useContext(BookmarksDispatchContext);

  const { data: session } = useSession();
  const userId = session.user.id;

  var bookmark = bookmarks.find(
    (bookmark) => bookmark.node.id === conversation.id
  );

  const bookmarkIcon = bookmark ? "bookmark" : ["far", "bookmark"];

  const [connectBookmark] = useMutation(ConnectBookmarkMutation);
  const [disconnectBookmark] = useMutation(DisconnectBookmarkMutation);

  const onBookmark = useCallback(async () => {
    const { id: conversationId } = conversation;
    if (bookmark) {
      await disconnectBookmark({
        variables: {
          userId,
          conversationId,
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
          userId,
          conversationId,
          createdAt,
          createdAtInt,
        },
      });
      dispatch({
        type: "addBookmark",
        bookmark,
      });
    }
  }, [
    dispatch,
    bookmark,
    conversation,
    connectBookmark,
    disconnectBookmark,
    userId,
  ]);

  return (
    <button
      title="Bookmark conversation"
      onClick={onBookmark}
      className={className}
    >
      <FontAwesomeIcon
        icon={bookmarkIcon}
        className={classnames("text-tertiary", {
          "": bookmark,
          "opacity-50": !bookmark,
        })}
      />
    </button>
  );
}
