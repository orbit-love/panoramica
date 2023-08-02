"use client";

import React from "react";
import SiteHeader from "src/components/ui/SiteHeader";
import { ProjectContext } from "src/components/context/ProjectContext";
import Community from "src/models/Community";

import Themed from "src/components/context/Themed";
import ConversationFeed from "src/components/domain/public/ConversationFeed";
import SearchConversations from "src/components/domain/public/SearchConversations";

const RecentConversations = (props) => {
  const { community } = props;

  const conversationIds = community.activities.map((a) => a.conversationId);
  var activities = community.activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversationId) === index;
  });

  // filter out conversations with no replies
  activities = activities.filter((activity) => {
    const conversationActivity = community.findActivityById(
      activity.conversationId
    );
    const conversation = community.conversations[conversationActivity.id];
    return conversation?.children?.length > 0;
  });

  return <ConversationFeed {...props} activities={activities} />;
};

export default function WelcomePage({ project, data }) {
  const community = new Community({ result: data });
  const object = { project, community };

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <SiteHeader hideLogo />
        <div className="flex-col py-8 pt-16 space-y-12 h-full sm:flex-row sm:px-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="text-3xl font-bold">{project.name}</div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="text-tertiary px-6 text-center">
              Search Conversations
            </div>
            <div className="flex flex-col space-y-6 sm:max-w-[700px] sm:self-center w-full">
              <SearchConversations project={project} community={community} />
            </div>
          </div>
          <div className="flex flex-col space-y-9 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
            <div className="flex overflow-x-hidden flex-col space-y-4 w-full">
              <div className="text-tertiary px-6 text-center">
                Recent Conversations
              </div>
              <div className="sm:self-center sm:max-w-[700px] sm:dark:border-gray-700 flex overflow-y-scroll flex-col h-full sm:border sm:border-gray-200">
                <RecentConversations project={project} community={community} />
              </div>
            </div>
          </div>
          <div className="h-12" />
        </div>
      </ProjectContext.Provider>
    </Themed>
  );
}
