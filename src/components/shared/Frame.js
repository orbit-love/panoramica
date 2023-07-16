import React, { useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createPortal } from "react-dom";

import c from "lib/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WidgetContext } from "components/skydeck/WidgetContext";

export default function Frame({ children }) {
  let { api } = useContext(WidgetContext);
  let { fullscreen } = api.panel.params || {};

  const exitFullscreen = () => {
    api.updateParameters({ fullscreen: false });
  };

  // do the portal thing
  if (api?.isActive && fullscreen) {
    return createPortal(
      <div className="bg-opacity-90 absolute top-0 left-0 z-10 p-5 w-full h-full bg-indigo-900">
        <div className="relative flex flex-col bg-[#150d33] border border-indigo-800 rounded-sm h-full">
          <button
            onClick={exitFullscreen}
            className="bg-opacity-50 flex items-center pt-2 pb-2 px-4 bg-indigo-700"
          >
            <div className="text-sm text-white">{api.title}</div>
            <div className="absolute top-1 right-3">
              <FontAwesomeIcon icon="xmark" className="" />
            </div>
          </button>
          <div className="overflow-y-scroll grow">{children}</div>
        </div>
      </div>,
      document.body
    );
  }

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
