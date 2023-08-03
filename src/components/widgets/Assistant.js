import React from "react";
import Chat from "../domains/ai/Chat";
import Frame from "./base/Frame";

export default function Assistant({ project, prompts }) {
  var globalPrompts = prompts.filter((prompt) => prompt.type === "Global");
  return (
    <Frame fullWidth>
      <Chat project={project} examplePrompts={globalPrompts} />
    </Frame>
  );
}
