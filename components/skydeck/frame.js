import React from "react";
import c from "lib/common";

export default function Frame({ children }) {
  const classes = `relative overflow-y-auto h-full text-[${c.whiteColor}] border border-indigo-800 bg-opacity-30`;
  return <div className={classes}>{children}</div>;
}
