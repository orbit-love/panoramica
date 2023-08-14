"use client";

import React, { useContext } from "react";
import Link from "next/link";

import { ProjectContext } from "src/components/context/ProjectContext";
import PublicAssistant from "src/components/domains/welcome/PublicAssistant";

export default function AssistantPage() {
  const { project } = useContext(ProjectContext);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex px-6 space-x-4 text-lg text-center">
        <Link
          className="text-tertiary hover:underline"
          href={`/projects/${project.id}/welcome`}
        >
          Search Conversations
        </Link>
        <div className="font-semibold">AI Assistant</div>
      </div>
      <div className="flex flex-col space-y-2 sm:max-w-[700px] sm:self-center w-full">
        <PublicAssistant project={project} />
      </div>
    </div>
  );
}
