import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header({ children, remove }) {
  return (
    <>
      <div className="flex items-center pb-2 pt-3 px-4 space-x-1">
        <div className="flex items-center space-x-2 text-lg font-semibold whitespace-nowrap">
          {children}
        </div>
        <div className="!mx-auto" />
        <button className="text-center" onClick={remove}>
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
      <div className="border-b border-indigo-900" />
      <div className="pt-1" />
    </>
  );
}
