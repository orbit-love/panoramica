"use client";

import React, { useEffect, useContext } from "react";
import Link from "next/link";

import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import PublicAssistant from "src/components/domain/public/PublicAssistant";
import { getPrompts } from "src/data/client/fetches/prompts";

export default function AssistantPage() {
  const { project, prompts } = useContext(ProjectContext);
  const dispatch = useContext(ProjectDispatchContext);

  useEffect(() => {
    getPrompts({
      project,
      type: "Public",
      onSuccess: ({ result: { prompts } }) => {
        dispatch({
          type: "updatePrompts",
          prompts,
        });
      },
    });
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-tertiary flex px-6 space-x-4 text-center">
        <Link
          className="hover:underline"
          href={`/projects/${project.id}/welcome`}
        >
          Search Conversations
        </Link>
        <div className="font-semibold">AI Assistant</div>
      </div>
      <div className="flex flex-col space-y-2 sm:max-w-[700px] sm:self-center w-full">
        <PublicAssistant project={project} prompts={prompts} />
      </div>
    </div>
  );
}
