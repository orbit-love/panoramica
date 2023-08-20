import React, { useState } from "react";
import { createPortal } from "react-dom";

import Modal from "src/components/ui/Modal";
import ThemeSelector from "src/components/ui/ThemeSelector";

export default function ThemeAction({ children }) {
  const [editingTheme, setEditingTheme] = useState(false);

  const toggleEditingTheme = () => {
    setEditingTheme((editingTheme) => !editingTheme);
  };

  return (
    <>
      <div onClick={toggleEditingTheme}>{children}</div>
      {editingTheme &&
        createPortal(
          <Modal title="Change Theme" close={toggleEditingTheme}>
            <ThemeSelector />
          </Modal>,
          document.body
        )}
    </>
  );
}
