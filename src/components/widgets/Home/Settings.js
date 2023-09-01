import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ThemeAction from "src/components/domains/bookmarks/ThemeAction";
import { aiReady } from "src/integrations/ready";

export default function Settings({
  project,
  newPanelPosition,
  addWidget,
  resetWidgets,
  user,
}) {
  const onClickEditPrompts = (e) => {
    e.preventDefault();
    addWidget("edit-prompts", "EditPrompts", {
      title: "Edit Prompts",
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

  const onClickIndexDocumentation = (e) => {
    e.preventDefault();
    addWidget("index-documentation", "IndexDocumentation", {
      title: "Index Documentation",
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
        <div className="flex flex-col items-start">
          <div
            className="cursor-pointer hover:underline"
            onClick={onClickEditPrompts}
          >
            Edit Prompts
          </div>
          {aiReady(project) && (
            <div
              className="cursor-pointer hover:underline"
              onClick={onClickIndexDocumentation}
            >
              Index Documentation
            </div>
          )}
          <ThemeAction>
            <div className="cursor-pointer hover:underline">Change Theme</div>
          </ThemeAction>
          <div
            className="cursor-pointer hover:underline"
            onClick={resetWidgets}
          >
            Reset Layout
          </div>
        </div>
      </div>
    </>
  );
}
