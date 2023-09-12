import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BookmarkAction from "src/components/domains/bookmarks/BookmarkAction";
import classnames from "classnames";

export default function Toolbar({
  project,
  conversation,
  onOpen,
  onExpand,
  canExpand,
  expanded,
}) {
  const expandIcon = expanded ? "chevron-up" : "chevron-down";
  const buttonClasses = "hover:text-tertiary";
  return (
    <div className="group-hover/menu:flex bg-opacity-80 hidden absolute bottom-3 right-6 py-[0.25rem] px-5 space-x-4 bg-gray-200 border-gray-300 rounded-full border dark:bg-gray-900 dark:border-gray-700">
      <BookmarkAction
        project={project}
        conversation={conversation}
        className={classnames(buttonClasses, "text-sm")}
      />
      {canExpand && (
        <button onClick={onExpand} className={buttonClasses}>
          <FontAwesomeIcon icon={expandIcon} />
        </button>
      )}
      <button onClick={onOpen} className={buttonClasses}>
        <FontAwesomeIcon icon="arrow-right" />
      </button>
    </div>
  );
}
