import React, { useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createPortal } from "react-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WidgetContext } from "src/components/context/WidgetContext";

export default function Frame({ children }) {
  let { api } = useContext(WidgetContext);
  let { fullscreen } = api.panel.params || {};

  const exitFullscreen = () => {
    api.updateParameters({ fullscreen: false });
  };

  // put the portal in .dv-dockview so it picks up the theme
  if (api?.isActive && fullscreen) {
    return createPortal(
      <ErrorBoundary
        fallback={
          <div className="p-4 text-red-500">Oops! Something went wrong.</div>
        }
      >
        <div className="absolute top-0 left-0 z-10 p-5 w-full h-full">
          <div className="theme-bg-color flex relative flex-col h-full rounded-sm border border-indigo-900">
            <button
              onClick={exitFullscreen}
              className="flex items-center pt-2 pb-2 px-4 bg-indigo-900"
            >
              <div className="text-sm text-white">{api.title}</div>
              <div className="absolute top-1 right-3">
                <FontAwesomeIcon icon="xmark" className="" />
              </div>
            </button>
            <div className="overflow-y-scroll grow">{children}</div>
          </div>
        </div>
      </ErrorBoundary>,
      document.querySelector(".dv-dockview")
    );
  }

  const classes = `relative overflow-y-auto h-full border border-indigo-950`;
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
