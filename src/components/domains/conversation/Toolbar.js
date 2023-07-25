import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Toolbar({
  onOpen,
  onExpand,
  canExpand,
  expanded,
  bookmark,
  onBookmark,
}) {
  const expandIcon = expanded ? "chevron-up" : "chevron-down";
  const bookmarkIcon = bookmark ? "bookmark" : ["far", "bookmark"];
  return (
    <div className="group-hover/menu:flex text-tertiary bg-opacity-80 hidden absolute bottom-4 right-6 py-1 px-5 space-x-4 bg-gray-200 rounded-full dark:bg-gray-700">
      {canExpand && (
        <button onClick={onExpand}>
          <FontAwesomeIcon icon={expandIcon} />
        </button>
      )}
      <button onClick={onBookmark}>
        <FontAwesomeIcon icon={bookmarkIcon} className="text-sm" />
      </button>
      {
        <button onClick={onOpen}>
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      }
    </div>
  );
}
