import React from "react";
import Chat from "../domains/ai/Chat";

export default function Assistant({ project }) {
  return <Chat project={project} />;
}
