import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Sorter({
  sort,
  setSort,
  setSortOpen,
  members,
  setMembers,
  classes,
}) {
  const buttonClasses =
    "hover:bg-indigo-600 px-2 py-1 rounded-md whitespace-nowrap";
  const changeSort = (newSort) => {
    members.prepareToRender({ sort: newSort });
    setMembers(members);
    setSort(newSort);
  };
  return (
    <div
      className={`${classes} bg-opacity-100 left-[-101px] bottom-[55px] border-1 absolute px-4 py-4 text-sm`}
    >
      <div className="flex flex-col space-y-5">
        <div className="flex font-bold">
          <div>Sort Members By:</div>
          <div className="mx-auto" />
          <button onClick={() => setSortOpen(false)}>
            <FontAwesomeIcon icon="xmark" />
          </button>
        </div>
        <div className="flex-start flex space-x-2">
          <button
            className={`${buttonClasses} ${
              sort === "gravity" && "bg-indigo-600"
            }`}
            onClick={() => changeSort("gravity")}
          >
            Gravity
          </button>
          <button
            className={`${buttonClasses} ${sort === "love" && "bg-indigo-600"}`}
            onClick={() => changeSort("love")}
          >
            Love
          </button>
          <button
            className={`${buttonClasses} ${
              sort === "reach" && "bg-indigo-600"
            }`}
            onClick={() => changeSort("reach")}
          >
            Reach
          </button>
          <button
            className={`${buttonClasses} ${
              sort === "delta" && "bg-indigo-600"
            }`}
            onClick={() => changeSort("delta")}
          >
            L-R Delta
          </button>
        </div>
      </div>
    </div>
  );
}
