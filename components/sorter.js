import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SortOptions from "components/sort_options";

export default function Sorter({
  sort,
  setSort,
  setSortOpen,
  community,
  setCommunity,
  classes,
  levels,
}) {
  return (
    <div
      className={`${classes} bg-opacity-100 left-[-100px] bottom-[55px] border-1 absolute px-4 py-4 text-sm select-none`}
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
          community={community}
          setCommunity={setCommunity}
          levels={levels}
        />
      </div>
    </div>
  );
}
