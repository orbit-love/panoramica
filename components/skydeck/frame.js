import React from "react";
import c from "lib/common";

export default function Frame({ children }) {
  const classes = `flex h-[96vh] space-x-3 rounded-lg text-[${c.whiteColor}] bg-indigo-800 border border-indigo-800 bg-opacity-30`;
  return (
    <div className={classes}>
      <div className="flex flex-col space-y-1 max-w-[450px] relative">
        {children}
      </div>
    </div>
  );
}
