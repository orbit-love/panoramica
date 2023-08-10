import React, { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Modal from "src/components/ui/Modal";
import ThemeSelector from "src/components/ui/ThemeSelector";

export default function Settings({
  project,
  newPanelPosition,
  addWidget,
  resetWidgets,
  user,
}) {
  const [editingTheme, setEditingTheme] = useState(false);

  const toggleEditingTheme = () => {
    setEditingTheme(!editingTheme);
  };

  const onClickEditPrompts = (e) => {
    e.preventDefault();
    addWidget("edit-prompts", "EditPrompts", {
      title: "Edit Prompts",
      position: newPanelPosition(),
    });
  };

  const onClickEditProject = (e) => {
    e.preventDefault();
    addWidget("edit-project", "EditProject", {
      title: "Edit Project",
      position: newPanelPosition(),
    });
  };

  const onClickUser = (e) => {
    e.preventDefault();
    addWidget("user", "User", {
      title: "User",
      position: newPanelPosition(),
    });
  };

  return (
    <>
      {project.demo && (
        <div className="flex flex-col items-start w-full">
          <div className="text-tertiary pt-2 font-semibold">Portal</div>
          <div className="flex flex-col items-start">
            <Link
              target="_blank"
              href={`/projects/${project.id}/welcome`}
              prefetch={false}
              className="hover:underline"
            >
              <FontAwesomeIcon icon="arrow-up-right-from-square" /> View Site
            </Link>
          </div>
        </div>
      )}
      <div className="flex flex-col items-start w-full">
        <div className="text-tertiary pb-1 pt-2 font-semibold">Settings</div>
        <div className="flex flex-col items-start text-sm text-gray-400 dark:text-gray-500">
          <button className="hover:underline" onClick={onClickEditProject}>
            Project Settings
          </button>
          <button className="hover:underline" onClick={onClickEditPrompts}>
            Edit Prompts
          </button>
          {user && (
            <>
              <button className="hover:underline" onClick={onClickUser}>
                API Settings
              </button>
            </>
          )}
          <button className="hover:underline" onClick={toggleEditingTheme}>
            Change Theme
          </button>
          <button className="hover:underline" onClick={resetWidgets}>
            Reset Layout
          </button>
          <Link
            className="hover:underline"
            prefetch={false}
            href={`/dashboard`}
          >
            Exit to Dashboard
          </Link>
        </div>
      </div>
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
