import React, { useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import ErrorBoundary from "src/components/widgets/base/ErrorBoundary";

import Header from "./Home/Header";
import Sources from "./Home/Sources";
import Search from "./Home/Search";
import Setup from "./Home/Setup";
import Explore from "./Home/Explore";
import Settings from "./Home/Settings";
import { Frame, resetLayout } from "src/components/widgets";
import GetActivityCountQuery from "./Home/GetActivityCount.gql";

export default function Home({
  project,
  dispatch,
  api,
  containerApi,
  addWidget,
  handlers,
}) {
  const [imported, setImported] = React.useState(true);
  const [importChecked, setImportChecked] = React.useState(false);

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

  return (
    <Frame>
      <Header project={project} imported={imported} />
      <HomeInner
        project={project}
        dispatch={dispatch}
        addWidget={addWidget}
        handlers={handlers}
        user={user}
        resetWidgets={resetWidgets}
        newPanelPosition={newPanelPosition}
        imported={imported}
        setImported={setImported}
        importChecked={importChecked}
        setImportChecked={setImportChecked}
      />
    </Frame>
  );
}

function HomeInner({
  project,
  dispatch,
  addWidget,
  handlers,
  user,
  resetWidgets,
  newPanelPosition,
  imported,
  setImported,
  importChecked,
  setImportChecked,
}) {
  const { id: projectId } = project;
  const { refetch } = useQuery(GetActivityCountQuery, {
    variables: {
      projectId,
    },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const { projects } = data;
      const isImported =
        projects.length > 0 &&
        projects[0].activitiesConnection &&
        projects[0].activitiesConnection.totalCount > 0;
      setImported(isImported);
      setImportChecked(true);
    },
  });

  const onClickEditProject = (e) => {
    e.preventDefault();
    addWidget("edit-project", "EditProject", {
      title: "Edit Project",
      position: newPanelPosition(),
    });
  };

  const onClickApiSettings = (e) => {
    e.preventDefault();
    addWidget("user", "User", {
      title: "User",
      position: newPanelPosition(),
    });
  };

  return (
    <div className="flex flex-col pt-1 px-6">
      <ErrorBoundary>
        {!imported && importChecked && (
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
            <Search newPanelPosition={newPanelPosition} addWidget={addWidget} />
            <Explore
              addWidget={addWidget}
              handlers={handlers}
              newPanelPosition={newPanelPosition}
            />
            <React.Suspense fallback={<div />}>
              <Sources
                handlers={handlers}
                newPanelPosition={newPanelPosition}
                project={project}
              />
            </React.Suspense>
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
      <div className="mt-4">
        <div>
          <a
            className="cursor-pointer hover:underline"
            onClick={onClickEditProject}
          >
            Edit Settings
          </a>
        </div>
        <div
          className="cursor-pointer hover:underline"
          onClick={onClickApiSettings}
        >
          API Settings
        </div>
        <Link className="hover:underline" href={`/projects`}>
          Exit
        </Link>
      </div>
      <div className="my-auto" />
    </div>
  );
}
