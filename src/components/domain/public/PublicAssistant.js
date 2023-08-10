import React from "react";

import Chat from "src/components/domains/ai/Chat";

export default function PublicAssistant({ project, prompts }) {
  var placeholder = `Hi! I'm an AI Assistant here to help you navigate the ${project.name}.`;
  return (
    <div className="flex flex-col justify-end h-[calc(100vh-180px)]">
      <Chat
        project={project}
        examplePrompts={prompts}
        placeholder={placeholder}
      />
    </div>
  );
}
