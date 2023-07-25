import React from "react";
import Chat from "../domains/ai/Chat";
import Frame from "./base/Frame";

export default function Assistant({ project }) {
  return (
    <Frame fullWidth>
      <Chat project={project} />
    </Frame>
  );
}
