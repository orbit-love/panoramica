import React, { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { WidgetContext } from "src/components/context/WidgetContext";
import ScrollManager from "src/components/widgets/base/ScrollManager";
import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";
import Modal from "src/components/ui/Modal";

export default function Frame({ children }) {
  let { api } = useContext(WidgetContext);
  let { fullscreen } = api.panel.params || {};
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    var disposable = api.onDidActiveChange(({ isActive }) => {
      setIsActive(isActive);
    });
    return () => disposable.dispose();
  }, [api]);

  const exitFullscreen = () => {
    api.updateParameters({ fullscreen: false });
  };

  if (api.isActive && fullscreen) {
    return createPortal(
      <ErrorBoundary>
        <Modal title={api.title} close={exitFullscreen} fullHeight>
          {children}
        </Modal>
      </ErrorBoundary>,
      document.body
    );
  }

  return (
    <ErrorBoundary>
      <ScrollManager isActive={isActive}>{children}</ScrollManager>
    </ErrorBoundary>
  );
}
