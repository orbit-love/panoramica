import React, { useCallback, useEffect, useState, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gql } from "graphql-tag";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { Frame, resetLayout } from "src/components/widgets";
import { putProjectRefresh, getProject } from "src/data/client/fetches";
import Loader from "src/components/domains/ui/Loader";
import { useSession } from "next-auth/react";

import Sources from "./Home/Sources";
import Search from "./Home/Search";
import Setup from "./Home/Setup";
import Explore from "./Home/Explore";
import Settings from "./Home/Settings";

const GET_ACTIVITIES = gql`
  query ($projectId: ID!) {
    projects(where: { id: $projectId }) {
      activitiesConnection(first: 1) {
        edges {
          node {
            source
          }
        }
      }
    }
  }
`;

export default function Home(props) {
  const { project, dispatch, api, containerApi, addWidget, handlers } = props;
  const [loading, setLoading] = useState(false);

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
    data: {
      projects: [{ activitiesConnection }],
    },
  } = useSuspenseQuery(GET_ACTIVITIES, {
    variables: {
      projectId,
    },
  });

  const activities = activitiesConnection.edges.map((edge) => edge.node);
  const imported = activities.length > 0;

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    await putProjectRefresh({ project, onSuccess: () => {} });
    console.log("Project refreshed");
  }, [project]);

  // refresh the project every minute to fetch new data
  useEffect(() => {
    if (imported) {
      var interval = setInterval(() => {
        refreshProject();
      }, 60 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [imported, refreshProject]);

  const Header = ({ project, loading }) => {
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
          {loading && (
            <div className="pl-2 font-normal">
              <Loader />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Frame>
      <Header project={project} loading={loading} />
      <div className="flex flex-col pt-1 px-6">
        {!imported && (
          <Setup
            project={project}
            dispatch={dispatch}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {imported && (
          <div className="flex flex-col items-start space-y-6">
            <Search newPanelPosition={newPanelPosition} addWidget={addWidget} />
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
        <div className="my-auto" />
      </div>
    </Frame>
  );
}
