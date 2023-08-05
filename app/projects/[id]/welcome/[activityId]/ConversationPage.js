"use client";

import React, { useContext } from "react";
import { useRouter } from "next/navigation";

import { ProjectContext } from "src/components/context/ProjectContext";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import SimilarConversations from "src/components/domain/public/SimilarConversations";
import SourceAction from "src/components/domains/conversation/SourceAction";
import utils from "src/utils";

export default function ConversationPage({ activity, similarConversations }) {
  const router = useRouter();
  const { project, community } = useContext(ProjectContext);

  const onClickTimestamp = (activity) =>
    `/projects/${project.id}/welcome/${activity.conversationId}`;
  const onClickTimestampWithAnchor = (activity) =>
    `/projects/${project.id}/welcome/${activity.conversationId}#${activity.id}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
  };

  const Back = () => (
    <button
      onClick={() => router.back()}
      className="btn font-semibold !w-24 !flex-none text-center text-sm"
    >
      Back
    </button>
  );

  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex flex-col items-center space-y-6 sm:max-w-[700px] w-full">
        <div className="flex flex-col justify-center items-center px-6 space-x-2 space-y-2 w-full sm:flex-row sm:items-center sm:px-0">
          <div className="text-secondary grow text-xl font-bold">
            {activity.summary}
          </div>
          <Back />
          {activity.url && (
            <SourceAction
              activity={activity}
              className="btn !bg-secondary text-sm !flex-none font-semibold text-center"
            >
              Open on {utils.titleize(activity.source)}
            </SourceAction>
          )}
        </div>
        <div className="py-4 px-6 w-full bg-gray-50 rounded-lg shadow">
          <FullThreadView
            project={project}
            key={activity}
            activity={activity}
            community={community}
            handlers={{
              ...handlers,
              onClickTimestamp: onClickTimestampWithAnchor,
            }}
            linkAllTimestamps
          />
        </div>
        <Back />
        <div className="flex flex-col space-y-6 w-full">
          <div className="text-tertiary">Similar Conversations</div>
          <SimilarConversations
            project={project}
            community={community}
            handlers={{ ...handlers, onClickTimestamp }}
            similarConversations={similarConversations}
          />
        </div>
        <Back />
      </div>
    </div>
  );
}
