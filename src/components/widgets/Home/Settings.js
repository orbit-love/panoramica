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
