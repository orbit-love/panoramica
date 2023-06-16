import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SortOptions({
  sort,
  setSort,
  community,
  setCommunity,
  levels,
}) {
  const buttonClasses =
    "hover:border-b hover:border-indigo-600 px-2 py-1 whitespace-nowrap";
  const changeSort = (newSort) => {
    if (community.members[0]) {
      community.members[0].reset = true;
    }
    community.sortMembers({ sort: newSort, levels });
    setCommunity(community);
    setSort(newSort);
  };
  const activeClass = "border-b border-indigo-800";
  return (
    <>
      <div className="flex-start flex items-center space-x-1">
        <button
          className={`${buttonClasses} ${sort === "gravity" && activeClass}`}
          onClick={() => changeSort("gravity")}
        >
          Gravity
        </button>
        <button
          className={`${buttonClasses} ${sort === "love" && activeClass}`}
          onClick={() => changeSort("love")}
        >
          Love
        </button>
        <button
          className={`${buttonClasses} ${sort === "reach" && activeClass}`}
          onClick={() => changeSort("reach")}
        >
          Reach
        </button>
        <button
          className={`${buttonClasses} ${sort === "delta" && activeClass}`}
          onClick={() => changeSort("delta")}
        >
          L-R Delta
        </button>
      </div>
    </>
  );
}
