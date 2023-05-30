import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SortOptions from "components/sort_options";

export default function Sorter({
  sort,
  setSort,
  setSortOpen,
  members,
  setMembers,
  classes,
}) {
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
        <SortOptions
          sort={sort}
          setSort={setSort}
          members={members}
          setMembers={setMembers}
        />
      </div>
    </div>
  );
}
