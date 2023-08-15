import React from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import Chat from "src/components/domains/ai/Chat";
import GetPromptsQuery from "src/graphql/queries/GetPrompts.gql";

export default function PublicAssistant({ project }) {
  const { id: projectId } = project;
  const {
    data: {
      projects: [{ prompts }],
    },
  } = useSuspenseQuery(GetPromptsQuery, {
    variables: {
      projectId,
    },
  });

  var placeholder = `Hi! I'm an AI Assistant here to help you navigate ${project.name}.`;
  return (
    <div className="flex flex-col justify-end h-[calc(100vh-200px)]">
      <Chat
        project={project}
        examplePrompts={prompts}
        placeholder={placeholder}
      />
    </div>
  );
}
