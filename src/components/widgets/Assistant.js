import React from "react";
import Chat from "../domains/ai/Chat";
import Frame from "./base/Frame";

export default function Assistant({ project, community, prompts }) {
  var globalPrompts = prompts.filter((prompt) => prompt.type === "Global");
  return (
    <Frame fullWidth>
      <Chat
        project={project}
        community={community}
        examplePrompts={globalPrompts}
      />
    </Frame>
  );
}
