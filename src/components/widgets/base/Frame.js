import React, { useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createPortal } from "react-dom";

import { WidgetContext } from "src/components/context/WidgetContext";
import Modal from "src/components/ui/Modal";

export default function Frame({ children }) {
  let { api } = useContext(WidgetContext);
  let { fullscreen } = api.panel.params || {};

  const exitFullscreen = () => {
    api.updateParameters({ fullscreen: false });
  };

  if (api?.isActive && fullscreen) {
    return createPortal(
      <ErrorBoundary
        fallback={
          <div className="text-alert p-4">Oops! Something went wrong.</div>
        }
      >
        <Modal title={api.title} close={exitFullscreen} fullHeight>
          {children}
        </Modal>
      </ErrorBoundary>,
      document.body
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="text-alert p-4">Oops! Something went wrong.</div>
      }
    >
      <div className="overflow-y-auto relative h-full">{children}</div>
    </ErrorBoundary>
  );
}
