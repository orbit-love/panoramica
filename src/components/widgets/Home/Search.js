import React, { useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHotkeys } from "react-hotkeys-hook";

export default function Search({ newPanelPosition, addWidget }) {
  let searchRef = useRef();

  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      searchRef.current.focus();
    },
    []
  );

  const onSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      var term = searchRef.current.value;
      var id = term ? `search-${term}` : "search";
      addWidget(id, "Search", {
        title: term || "Search",
        position: newPanelPosition(),
      });
      searchRef.current.value = "";
      searchRef.current.blur();
    },
    [addWidget, newPanelPosition]
  );

  return (
    <div className="flex flex-col items-start space-y-2">
      <form onSubmit={onSearchSubmit} className="flex space-x-2">
        <input
          type="search"
          ref={searchRef}
          placeholder="Search..."
          className="!w-full"
        />
        <button className="btn" type="submit">
          <FontAwesomeIcon icon="search" />
        </button>
      </form>
    </div>
  );
}
