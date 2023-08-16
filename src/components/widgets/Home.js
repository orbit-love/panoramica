import React, { useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";

import Header from "./Home/Header";
import Sources from "./Home/Sources";
import Search from "./Home/Search";
import Setup from "./Home/Setup";
import Explore from "./Home/Explore";
import Settings from "./Home/Settings";
import { Frame, resetLayout } from "src/components/widgets";
import GetActivityCountQuery from "./Home/GetActivityCount.gql";

export default function Home(props) {
  const { project, dispatch, api, containerApi, addWidget, handlers } = props;

  var user,
    { data: session } = useSession();
  if (session && session.user && !session.user.fake) {
    user = session.user;
  }

  // for opening new panels, either place them in the group to
  // the immediate right or open a new group on the right
  // this ensures no panels open in the Home group
  const newPanelPosition = useCallback(() => {
    if (containerApi) {
      if (containerApi.groups.length > 1) {
        let referenceGroup = containerApi.groups[1];
        return {
          referenceGroup,
          direction: "within",
        };
      } else {
        return { direction: "right" };
      }
    }
  }, [containerApi]);

  // constraints don't seem to be serialized so reapply them
  // these avoid the home bar getting very wide when othen panels are
  // opened and closed
  useEffect(() => {
    api.group.api.setConstraints({ minimumWidth: 175, maximumWidth: 250 });
  }, [api]);

  const resetWidgets = useCallback(() => {
    resetLayout({ project, containerApi });
  }, [project, containerApi]);

  const { id: projectId } = project;
  const {
    data: { projects },
    refetch,
  } = useSuspenseQuery(GetActivityCountQuery, {
    variables: {
      projectId,
    },
  });

  const imported =
    projects.length > 0 &&
    projects[0].activitiesConnection &&
    projects[0].activitiesConnection.totalCount > 0;

  const onClickEditProject = (e) => {
    e.preventDefault();
    addWidget("edit-project", "EditProject", {
      title: "Edit Project",
      position: newPanelPosition(),
    });
  };

  return (
    <Frame>
      <Header project={project} imported={imported} />
      <div className="flex flex-col pt-1 px-6">
        <ErrorBoundary>
          {!imported && (
            <Setup
              project={project}
              dispatch={dispatch}
              addWidget={addWidget}
              newPanelPosition={newPanelPosition}
              refetch={refetch}
            />
          )}
          {imported && (
            <div className="flex flex-col items-start space-y-4">
              <Search
                newPanelPosition={newPanelPosition}
                addWidget={addWidget}
              />
              <Explore
                addWidget={addWidget}
                handlers={handlers}
                newPanelPosition={newPanelPosition}
              />
              <Sources
                handlers={handlers}
                newPanelPosition={newPanelPosition}
                project={project}
              />
              <Settings
                addWidget={addWidget}
                newPanelPosition={newPanelPosition}
                project={project}
                resetWidgets={resetWidgets}
                user={user}
              />
            </div>
          )}
        </ErrorBoundary>
        <div>
          <div>
            <a
              className="cursor-pointer hover:underline"
              onClick={onClickEditProject}
            >
              Edit Settings
            </a>
          </div>
          <Link className="hover:underline" href={`/projects`}>
            Exit
          </Link>
        </div>
        <div className="my-auto" />
      </div>
    </Frame>
  );
}
