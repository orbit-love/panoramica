"use client";

import React, { useContext } from "react";
import Link from "next/link";
import Loader from "src/components/domains/ui/Loader";
import { ProjectContext } from "src/components/context/ProjectContext";
import SearchConversations from "src/components/domains/welcome/SearchConversations";
import RecentConversations from "src/components/domains/welcome/RecentConversations";
import PinnedConversations from "src/components/domains/welcome/PinnedConversations";

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
        <div className="flex px-6 space-x-4 text-lg text-center">
          <div className="font-semibold">Search Conversations</div>
          <Link
            className="text-tertiary hover:underline"
            href={`/projects/${project.id}/welcome/assistant`}
          >
            AI Assistant
          </Link>
        </div>
        <div className="flex flex-col space-y-2 sm:max-w-[700px] sm:self-center w-full">
          <SearchConversations project={project} handlers={handlers} />
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="text-tertiary mb-6 text-lg text-center">
          Pinned Conversations
        </div>
        <div className="sm:self-center sm:w-[650px]">
          <React.Suspense
            fallback={
              <div className="p-6">
                <Loader />
              </div>
            }
          >
            <PinnedConversations project={project} handlers={handlers} />
          </React.Suspense>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="text-tertiary mb-6 text-lg text-center">
          Trending Conversations
        </div>
        <div className="sm:self-center sm:w-[650px]">
          <RecentConversations project={project} handlers={handlers} />
        </div>
      </div>
    </>
  );
}
