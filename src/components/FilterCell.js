import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function FilterCell({
  active,
  openFilter,
  setOpenFilter,
  name,
  displayName,
  children,
}) {
  const open = openFilter === name;
  return (
    <div className="relative">
      <div
        onClick={() =>
          setOpenFilter((openFilter) => (openFilter === name ? null : name))
        }
        className={classnames("py-2 px-4 whitespace-nowrap cursor-pointer", {
          "bg-gray-200 dark:bg-gray-700": open,
          "hover:dark:bg-gray-800 hover:bg-gray-100": !open,
        })}
      >
        <div
          className={classnames("select-none", {
            "text-blue-500": active,
          })}
        >
          {displayName}
        </div>
      </div>
      <div
        className={classnames(
          "mt-[1px] dark:bg-gray-950 min-w-[300px] absolute right-0 z-50 pt-2 font-normal bg-white border border-gray-200 dark:border-gray-700",
          {
            hidden: !open,
          }
        )}
      >
        <div className="absolute top-1 right-2">
          <FontAwesomeIcon
            icon="times"
            onClick={() => setOpenFilter(null)}
            className="cursor-pointer"
          />
        </div>
        <div className="flex flex-col pb-2 pt-3 px-4 space-y-2">
          <table>
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
