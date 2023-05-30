import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SortOptions({ sort, setSort, members, setMembers }) {
  const buttonClasses =
    "hover:border-b hover:border-indigo-600 px-2 py-1 whitespace-nowrap";
  const changeSort = (newSort) => {
    members.prepareToRender({ sort: newSort });
    setMembers(members);
    setSort(newSort);
  };
  const activeClass = "border-b border-indigo-600";
  return (
    <>
      <div className="flex-start flex items-center space-x-1">
        <FontAwesomeIcon icon="sort" className="pr-2" />
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
