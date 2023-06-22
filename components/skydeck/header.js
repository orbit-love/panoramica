import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header({ children, length, remove }) {
  return (
    <>
      <div className="flex items-baseline pb-2 pt-3 px-4 space-x-1">
        <span className="flex-inline items-baseline space-x-2 text-lg font-semibold">
          {children}
        </span>
        {length && <span className="px-1 text-indigo-500">{length}</span>}
        <span className="!mx-auto" />
        <button className="absolute top-3 right-4 text-lg" onClick={remove}>
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
      <div className="border-b border-indigo-900" />
      <div className="pt-1" />
    </>
  );
}
