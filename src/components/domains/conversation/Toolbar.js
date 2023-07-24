import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Toolbar({ onOpen, onExpand, canExpand, expanded }) {
  return (
    <div className="group-hover/menu:flex text-tertiary bg-opacity-80 hidden absolute bottom-4 right-6 py-1 px-3 space-x-4 bg-gray-200 rounded-full dark:bg-gray-700">
      {canExpand && (
        <>
          {expanded && (
            <button onClick={onExpand}>
              <FontAwesomeIcon icon="chevron-up" />
            </button>
          )}
          {!expanded && (
            <button onClick={onExpand}>
              <FontAwesomeIcon icon="chevron-down" />
            </button>
          )}
        </>
      )}
      {
        <button onClick={onOpen}>
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      }
    </div>
  );
}
