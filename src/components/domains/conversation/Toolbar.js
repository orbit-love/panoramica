import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BookmarkAction from "src/components/domains/bookmarks/BookmarkAction";

export default function Toolbar({
  project,
  activity,
  onOpen,
  onExpand,
  canExpand,
  expanded,
}) {
  const expandIcon = expanded ? "chevron-up" : "chevron-down";
  return (
    <div className="group-hover/menu:flex text-tertiary bg-opacity-80 hidden absolute bottom-4 right-6 py-1 px-5 space-x-4 bg-gray-200 rounded-full dark:bg-gray-700">
      {canExpand && (
        <button onClick={onExpand}>
          <FontAwesomeIcon icon={expandIcon} />
        </button>
      )}
      <BookmarkAction project={project} activity={activity} />
      {
        <button onClick={onOpen}>
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      }
    </div>
  );
}
