"use client";

import React, { useState } from "react";
import SiteHeader from "src/components/ui/SiteHeader";
import { ProjectContext } from "src/components/context/ProjectContext";
import Community from "src/models/Community";

import Themed from "src/components/context/Themed";
import SearchConversations from "src/components/domain/public/SearchConversations";
import RecentConversations from "src/components/domain/public/RecentConversations";
import PublicAssistant from "src/components/domain/public/PublicAssistant";

export default function WelcomePage({ project, data }) {
  const community = new Community({ result: data });
  const object = { project, community };
  const [showSearch, setShowSearch] = useState(true);

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <SiteHeader hideLogo />
        <div className="flex-col py-8 pt-16 space-y-12 h-full sm:flex-row sm:px-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="text-3xl font-bold">{project.name}</div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="text-tertiary flex px-6 space-x-4 text-center">
              {showSearch && (
                <div className="font-semibold">Search Conversations</div>
              )}
              {!showSearch && (
                <button
                  className="hover:underline"
                  onClick={() => setShowSearch(true)}
                >
                  Search Conversations
                </button>
              )}
              {showSearch && (
                <button
                  className="hover:underline"
                  onClick={() => setShowSearch(false)}
                >
                  AI Assistant
                </button>
              )}
              {!showSearch && <div className="font-semibold">AI Assistant</div>}
            </div>
            <div className="flex flex-col space-y-6 sm:max-w-[700px] sm:self-center w-full">
              {showSearch && (
                <SearchConversations project={project} community={community} />
              )}
              {!showSearch && (
                <PublicAssistant project={project} community={community} />
              )}
            </div>
          </div>
          {showSearch && (
            <>
              <div className="flex flex-col space-y-9 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
                <div className="flex overflow-x-hidden flex-col space-y-4 w-full">
                  <div className="text-tertiary px-6 text-center">
                    Recent Conversations
                  </div>
                  <div className="sm:self-center sm:max-w-[700px] sm:dark:border-gray-700 flex overflow-y-scroll flex-col h-full sm:border sm:border-gray-200">
                    <RecentConversations
                      project={project}
                      community={community}
                    />
                  </div>
                </div>
              </div>
              <div className="h-12" />
            </>
          )}
        </div>
      </ProjectContext.Provider>
    </Themed>
  );
}
