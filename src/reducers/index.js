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

export const bookmarksReducer = (object, { type, bookmarks, bookmark }) => {
  switch (type) {
    case "setBookmarks": {
      return {
        ...object,
        bookmarks,
      };
    }
    case "addBookmark": {
      return {
        ...object,
        bookmarks: [...object.bookmarks, bookmark],
      };
    }
    case "removeBookmark": {
      return {
        ...object,
        bookmarks: object.bookmarks.filter(
          (thisBookmark) => thisBookmark.node.id !== bookmark.node.id
        ),
      };
    }
  }
};
