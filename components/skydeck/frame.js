import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useHotkeys } from "react-hotkeys-hook";

import c from "lib/common";

export default function Frame({ api, children }) {
  useHotkeys(
    "escape",
    () => {
      if (api && api.isActive) {
        api.close();
      }
    },
    []
  );
  const classes = `relative overflow-y-auto h-full text-[${c.whiteColor}] border border-indigo-800 bg-opacity-30`;
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-red-500">Oops! Something went wrong.</div>
      }
    >
      <div className={classes}>{children}</div>
    </ErrorBoundary>
  );
}
