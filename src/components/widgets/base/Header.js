import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function Header({ children, remove }) {
  return (
    <>
      <div className={classnames("flex items-center px-4 py-4 space-x-1")}>
        <div className="flex overflow-hidden items-center space-x-2 w-full font-semibold whitespace-nowrap">
          {children}
        </div>
        {remove && (
          <>
            <div className="!mx-auto" />
            <button className="text-center" onClick={remove}>
              <FontAwesomeIcon icon="xmark" />
            </button>
          </>
        )}
        <div className="border-b border-indigo-900" />
      </div>
      <div className="pt-1" />
    </>
  );
}
