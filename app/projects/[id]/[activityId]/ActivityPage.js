"use client";

import React, { useState } from "react";
import SiteHeader from "src/components/ui/SiteHeader";
import classnames from "classnames";
import Link from "next/link";

import { ProjectContext } from "src/components/context/ProjectContext";
import Community from "src/models/Community";
import PreviewView from "src/components/domains/conversation/views/PreviewView";
import FullThreadView from "src/components/domains/conversation/views/FullThreadView";

import Themed from "src/components/context/Themed";

const EachActivity = (props) => {
  const { activity, community, index } = props;
  const [expanded, setExpanded] = useState(false);

  const onExpand = () => {
    let selection = window.getSelection().toString();
    if (canExpand && selection.length <= 0) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className={classnames(
        "group/menu flex flex-col py-6 px-6 relative border-b border-b-gray-300 dark:border-b-gray-700",
        {
          "hover:bg-gray-100 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-40":
            index % 2 === 0,
          "bg-gray-100 hover:bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 dark:hover:bg-opacity-90":
            index % 2 === 1,
        }
      )}
    >
      {expanded && (
        <FullThreadView {...props} activity={conversationActivity} />
      )}
      {!expanded && <PreviewView onExpand={onExpand} {...props} />}
    </div>
  );
};

export default function ActivityPage({ project, activity, data }) {
  const community = new Community({ result: data });
  const object = { project, community };

  const onClickTimestamp = (activity) =>
    `/projects/${project.id}/${activity.conversationId}`;
  const handlers = {
    onCLickMember: () => {},
    onClickChannel: () => {},
    onClickTimestamp,
  };

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <SiteHeader hideLogo />
        <div className="flex-col justify-center px-6 py-8 space-y-12 h-full sm:flex-row sm:px-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="text-3xl font-bold">{project.name}</div>
            <div className="text-tertiary font-light">
              <Link href={`/projects/${project.id}/welcome`}>Back</Link>
            </div>
          </div>
          <div className="flex-col space-y-6 sm:flex sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-6">
            <div className="flex overflow-x-hidden flex-col space-y-6 w-full sm:w-2/3">
              {activity.summary && (
                <div className="text-secondary text-2xl">
                  {`🧵 ${activity.summary}`}
                </div>
              )}
              <div className="text-lg">
                <FullThreadView
                  project={project}
                  key={activity}
                  activity={activity}
                  community={community}
                  handlers={handlers}
                />
              </div>
              <Link
                href={`/projects/${project.id}/welcome`}
                className="text-tertiary pb-6"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </ProjectContext.Provider>
    </Themed>
  );
}
