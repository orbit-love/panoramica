import React from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import Chat from "../domains/ai/Chat";
import Frame from "./base/Frame";
import GetPromptsByContextQuery from "src/graphql/queries/GetPromptsByContext.gql";

export default function Assistant({ project }) {
  const { id: projectId } = project;
  const context = "Global";
  const {
    data: {
      projects: [{ prompts }],
    },
  } = useSuspenseQuery(GetPromptsByContextQuery, {
    variables: {
      projectId,
      context,
    },
  });
  return (
    <Frame fullWidth>
      <Chat project={project} examplePrompts={prompts} />
    </Frame>
  );
}
