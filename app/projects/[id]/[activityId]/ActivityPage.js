"use client";

import React from "react";
import SiteHeader from "src/components/ui/SiteHeader";
import Link from "next/link";

import { ProjectContext } from "src/components/context/ProjectContext";
import Community from "src/models/Community";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";
import ActivityItem from "src/components/domains/public/ActivityItem";

import Themed from "src/components/context/Themed";
import SourceAction from "src/components/domains/conversation/SourceAction";
import utils from "src/utils";

const SimilarConversations = ({
  project,
  community,
  handlers,
  similarConversations,
}) => {
  // filter out and limit the number we show
  var scoreThreshold = 0.8;
  var activities = similarConversations
    .filter(({ score }) => score > scoreThreshold)
    .slice(0, 5)
    .map(({ id }) => community.findActivityById(id));

  return (
    <div className="text-lg">
      {activities.map((activity, index) => (
        <ActivityItem
          project={project}
          key={activity.id}
          index={index}
          activity={activity}
          community={community}
          handlers={handlers}
          className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700"
        />
      ))}
    </div>
  );
};

export default function ActivityPage({
  project,
  activity,
  similarConversations,
  data,
}) {
  const community = new Community({ result: data });
  const object = { project, community };

  const onClickTimestamp = (activity) =>
    `/projects/${project.id}/${activity.conversationId}`;
  const onClickTimestampWithAnchor = (activity) =>
    `/projects/${project.id}/${activity.conversationId}#${activity.id}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
  };

  const Back = ({ project }) => (
    <div className="py-8 text-center">
      <Link
        href={`/projects/${project.id}/welcome`}
        className="btn !w-24 text-center"
      >
        Back
      </Link>
    </div>
  );

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <SiteHeader hideLogo />
        <div className="flex-col py-8 pt-16 space-y-12 h-full sm:flex-row sm:px-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="text-3xl font-bold">{project.name}</div>
            <div className="text-tertiary font-light">
              <Link href={`/projects/${project.id}/welcome`}>Back</Link>
            </div>
          </div>
          <div className="flex-col justify-center px-6 space-y-6 sm:flex sm:flex-row sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col space-y-6 w-full sm:max-w-[700px]">
              <div className="flex flex-col justify-between items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                {activity.summary && (
                  <div className="text-secondary grow text-2xl font-bold">
                    {activity.summary}
                  </div>
                )}
                {activity.url && (
                  <div>
                    <SourceAction
                      activity={activity}
                      className="btn !bg-secondary text-sm !flex-none font-semibold text-center"
                    >
                      Open on {utils.titleize(activity.source)}
                    </SourceAction>
                  </div>
                )}
              </div>
              <div className="text-lg">
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
              <Back project={project} />
              <div className="flex flex-col py-3 space-y-6 w-full">
                <div className="text-tertiary text-lg">
                  Similar Conversations
                </div>
                <SimilarConversations
                  project={project}
                  community={community}
                  handlers={{ ...handlers, onClickTimestamp }}
                  similarConversations={similarConversations}
                />
                <Back project={project} />
              </div>
            </div>
          </div>
        </div>
      </ProjectContext.Provider>
    </Themed>
  );
}
