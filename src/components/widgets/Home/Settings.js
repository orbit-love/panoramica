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
}) {
  const onClickEditPrompts = (e) => {
    e.preventDefault();
    addWidget("edit-prompts", "EditPrompts", {
      title: "Edit Prompts",
      position: newPanelPosition(),
    });
  };

  const onClickManageQas = (e) => {
    e.preventDefault();
    addWidget("manage-qas", "ManageQas", {
      title: "Manage QAs",
      position: newPanelPosition(),
    });
  };

  const onClickManageData = (e) => {
    e.preventDefault();
    addWidget("manage-data", "ManageData", {
      title: "Manage Data",
      position: newPanelPosition(),
    });
  };

  const onClickLabelConversations = (e) => {
    e.preventDefault();
    const widgetId = `label-conversations-${new Date().getTime()}`;
    addWidget(widgetId, "LabelConversations", {
      title: "Label Conversations",
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
              onClick={onClickManageQas}
            >
              Manage QAs
            </div>
          )}

          <div
            className="cursor-pointer hover:underline"
            onClick={onClickManageData}
          >
            Manage Data
          </div>
          <div
            className="cursor-pointer hover:underline"
            onClick={onClickLabelConversations}
          >
            Label Conversations
          </div>
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
