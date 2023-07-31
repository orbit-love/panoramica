import React, { useCallback, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import {
  postCreateBookmark,
  deleteBookmark,
} from "src/data/client/fetches/bookmarks";
import { useSession } from "next-auth/react";

export default function BookmarkAction({ project, activity, className }) {
  const { bookmarks } = useContext(BookmarksContext);
  const dispatch = useContext(BookmarksDispatchContext);

  var bookmark = bookmarks?.find(
    (bookmark) => bookmark.activityId === activity.id
  );

  const bookmarkIcon = bookmark ? "bookmark" : ["far", "bookmark"];

  const onBookmark = useCallback(() => {
    if (bookmark) {
      deleteBookmark({
        project,
        activity,
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
        activity,
        onSuccess: ({ result }) => {
          const { bookmark } = result;
          dispatch({
            type: "addBookmark",
            bookmark,
          });
        },
      });
    }
  }, [project, dispatch, bookmark, activity]);

  var { data: session } = useSession();
  if (!session || !session.user || session.user.fake) {
    return <> </>;
  }

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
