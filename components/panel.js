import React from "react";
import classnames from "classnames";

import c from "lib/common";

export default function Panel({ className, children }) {
  const classes = `flex px-4 py-4 overflow-scroll space-x-3 rounded-lg text-[${c.whiteColor}] bg-[${c.backgroundColor}] border border-indigo-800 bg-opacity-90 pointer-events-auto`;
  return <div className={classnames(classes, className)}>{children}</div>;
}
