import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";
import { useSession } from "next-auth/react";

import Sources from "./Home/Sources";
import Search from "./Home/Search";
import Setup from "./Home/Setup";
import Explore from "./Home/Explore";
import Settings from "./Home/Settings";
import { Frame, resetLayout } from "src/components/widgets";
import { putProjectRefresh } from "src/data/client/fetches";
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

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    await putProjectRefresh({ project, onSuccess: () => {} });
    console.log("Project refreshed");
  }, [project]);

  // refresh the project every minute to fetch new data
  useEffect(() => {
    if (imported) {
      var interval = setInterval(() => {
        // refreshProject();
      }, 60 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [imported, refreshProject]);

  const onClickEditProject = (e) => {
    e.preventDefault();
    addWidget("edit-project", "EditProject", {
      title: "Edit Project",
      position: newPanelPosition(),
    });
  };

  const Header = ({ project }) => {
    return (
      <div className="py-2 px-6">
        <div className="flex items-center py-2 w-full whitespace-nowrap">
          <div className="overflow-hidden font-semibold text-ellipsis">
            {project.name}
          </div>
          <div title="Auto update every 60s">
            <FontAwesomeIcon
              icon="circle"
              className="pl-2 text-sm text-green-500"
            />
          </div>
          <div className="mx-auto" />
        </div>
      </div>
    );
  };

  return (
    <Frame>
      <Header project={project} />
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
