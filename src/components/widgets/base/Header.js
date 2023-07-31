import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header({ children, remove }) {
  return (
    <>
      <div className="flex items-center py-4 px-6 space-x-1">
        <div className="text-tertiary flex overflow-hidden items-center space-x-1 w-full font-light whitespace-nowrap">
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
      </div>
      <div className="pt-1" />
    </>
  );
}
