export const projectReducer = (object, { type, community, project }) => {
  switch (type) {
    case "updated": {
      return { ...object, community };
    }
    case "updateProject": {
      return { ...object, project };
    }
  }
};

const byCreatedAt = (a, b) => b.createdAtInt - a.createdAtInt;

export const bookmarksReducer = (object, { type, bookmarks, bookmark }) => {
  switch (type) {
    case "setBookmarks": {
      return {
        ...object,
        bookmarks: bookmarks.sort(byCreatedAt),
      };
    }
    case "addBookmark": {
      return {
        ...object,
        bookmarks: [...object.bookmarks, bookmark].sort(byCreatedAt),
      };
    }
    case "removeBookmark": {
      return {
        ...object,
        bookmarks: object.bookmarks
          .filter(
            (thisBookmark) => thisBookmark.activityId !== bookmark.activityId
          )
          .sort(byCreatedAt),
      };
    }
  }
};
