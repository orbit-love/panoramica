"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { ProjectContext } from "src/components/context/ProjectContext";
import SearchConversations from "src/components/domain/public/SearchConversations";
import RecentConversations from "src/components/domain/public/RecentConversations";

export default function WelcomePage() {
  const { project } = useContext(ProjectContext);

  const onClickTimestamp = (_, conversation) =>
    `/projects/${project.id}/welcome/${conversation.id}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
    onClickTimestamp,
  };

  return (
    <>
      <div className="flex flex-col items-center mb-4 space-y-4">
        <div className="text-tertiary flex px-6 space-x-4 text-center">
          <div className="font-semibold">Search Conversations</div>
          <Link
            className="hover:underline"
            href={`/projects/${project.id}/welcome/assistant`}
          >
            AI Assistant
          </Link>
        </div>
        <div className="flex flex-col space-y-2 sm:max-w-[700px] sm:self-center w-full">
          <SearchConversations project={project} handlers={handlers} />
        </div>
      </div>
      <div className="flex flex-col px-6 w-full">
        <div className="text-tertiary mb-6 text-center">
          Recent Conversations
        </div>
        <div className="sm:self-center sm:max-w-[700px] flex overflow-y-scroll flex-col h-full">
          <RecentConversations project={project} handlers={handlers} />
        </div>
      </div>
    </>
  );
}
