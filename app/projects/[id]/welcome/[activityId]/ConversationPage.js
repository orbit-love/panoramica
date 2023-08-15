"use client";

import React, { useContext } from "react";
import { ProjectContext } from "src/components/context/ProjectContext";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import SimilarConversations from "src/components/domains/search/SimilarConversations";
import SourceAction from "src/components/domains/conversation/SourceAction";
import ActivityItem from "src/components/domains/welcome/ActivityItem";
import Link from "next/link";
import utils from "src/utils";

export default function ConversationPage({ activity }) {
  const { project } = useContext(ProjectContext);

  const conversation = activity.conversation;
  const onClickTimestamp = (_, conversation) =>
    `/projects/${project.id}/welcome/${conversation.id}`;
  const onClickTimestampWithAnchor = (activity, conversation) =>
    `/projects/${project.id}/welcome/${conversation.id}#${activity.id}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
  };

  const Back = () => (
    <Link
      className="btn font-semibold !w-24 !flex-none text-center text-sm"
      href={`/projects/${project.id}/welcome`}
    >
      Back
    </Link>
  );

  const renderResults = ({ activities }) =>
    activities.map((activity) => (
      <ActivityItem
        key={activity.id}
        project={project}
        activity={activity}
        conversation={activity}
        handlers={{ ...handlers, onClickTimestamp }}
      />
    ));

  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex flex-col items-center space-y-6 sm:max-w-[700px] w-full">
        <div className="flex flex-col justify-center items-center px-6 space-x-2 space-y-2 w-full whitespace-nowrap sm:flex-row sm:items-center sm:px-0">
          <div className="text-secondary overflow-hidden grow mt-3 text-xl font-bold text-ellipsis">
            {activity.summary || activity.text.slice(0, 100)}
          </div>
          {activity.url && (
            <SourceAction
              activity={activity}
              className="btn !bg-secondary text-sm !flex-none font-semibold text-center"
            >
              Open on {utils.titleize(activity.source)}
            </SourceAction>
          )}
        </div>
        <div className="dark:bg-opacity-50 py-4 px-6 w-full bg-gray-50 rounded-lg shadow dark:bg-gray-800">
          <FullThreadView
            project={project}
            key={activity}
            activity={activity}
            conversation={conversation}
            handlers={{
              ...handlers,
              onClickTimestamp: onClickTimestampWithAnchor,
            }}
            linkAllTimestamps
          />
        </div>
        <Back />
        <div className="flex flex-col space-y-6 w-full">
          <div className="text-tertiary text-lg">Similar Conversations</div>
          <React.Suspense fallback={<div>Loading...</div>}>
            <SimilarConversations
              project={project}
              activity={activity}
              renderResults={renderResults}
            />
          </React.Suspense>
        </div>
        <Back />
      </div>
    </div>
  );
}
