import React from "react";

import Chat from "../domains/ai/Chat";

export default function Prompt({ project }) {
  return <Chat project={project} />;
}
