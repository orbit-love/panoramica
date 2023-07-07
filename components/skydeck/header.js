import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function Header({ children, api, remove }) {
  const [active, setActive] = useState(api.isActive);

  useEffect(() => {
    const disposable = api.onDidActiveChange(({ isActive }) => {
      setActive(isActive);
    });
    return () => {
      disposable.dispose();
    };
  }, [api]);

  return (
    <>
      <div
        className={classnames("flex items-center py-3 px-4 space-x-1", {
          // "bg-indigo-800": active,
        })}
      >
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
