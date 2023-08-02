import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHotkeys } from "react-hotkeys-hook";
import Link from "next/link";

import { BookmarksContext } from "src/components/context/BookmarksContext";
import { Frame, resetLayout } from "src/components/widgets";
import {
  putProjectImport,
  putProjectRefresh,
  getProject,
} from "src/data/client/fetches";
import utils from "src/utils";
import Community from "src/models/Community";
import Modal from "src/components/ui/Modal";
import ThemeSelector from "src/components/ui/ThemeSelector";
import Loader from "src/components/domains/ui/Loader";
import SourceIcon from "src/components/domains/activity/SourceIcon";
import { orbitImportReady } from "src/integrations/ready";
import { useSession } from "next-auth/react";

export default function Home(props) {
  let searchRef = useRef();
  const {
    project,
    community,
    dispatch,
    api,
    containerApi,
    addWidget,
    handlers,
  } = props;
  const { bookmarks } = useContext(BookmarksContext);
  const { onClickSource, onClickActivity } = handlers;
  const [loading, setLoading] = useState(false);
  const [editingTheme, setEditingTheme] = useState(false);

  var user,
    { data: session } = useSession();
  if (session && session.user && !session.user.fake) {
    user = session.user;
  }

  const toggleEditingTheme = () => {
    setEditingTheme(!editingTheme);
  };

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

  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      searchRef.current.focus();
    },
    []
  );

  const resetWidgets = useCallback(() => {
    resetLayout({ project, containerApi });
  }, [project, containerApi]);

  const fetchProject = useCallback(async () => {
    getProject({
      project,
      setLoading,
      onSuccess: ({ result }) => {
        const community = new Community({ result });
        dispatch({ type: "updated", community });
      },
    });
  }, [project, dispatch]);

  const importProject = useCallback(async () => {
    putProjectImport({
      project,
      setLoading,
      onSuccess: fetchProject,
    });
  }, [project, setLoading, fetchProject]);

  // prepare to render
  const empty = community?.activities?.length === 0;

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    await putProjectRefresh({ project, onSuccess: fetchProject });
    console.log("Project refreshed");
  }, [project, fetchProject]);

  // refresh the project every minute to fetch new data
  useEffect(() => {
    if (!empty) {
      var interval = setInterval(() => {
        refreshProject();
      }, 60 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [empty, refreshProject]);

  const onSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      var term = searchRef.current.value;
      var id = term ? `search-${term}` : "search";
      addWidget(id, "Search", {
        title: term || "Search",
        position: newPanelPosition(),
      });
      searchRef.current.value = "";
      searchRef.current.blur();
    },
    [addWidget, newPanelPosition]
  );

  const onClickBookmarks = (e) => {
    e.preventDefault();
    addWidget("bookmarks", "Bookmarks", {
      title: "Bookmarks",
      position: newPanelPosition(),
    });
  };

  const onClickEditProject = (e) => {
    e.preventDefault();
    addWidget("edit-project", "EditProject", {
      title: "Edit Project",
      position: newPanelPosition(),
    });
  };

  const onClickUser = (e) => {
    e.preventDefault();
    addWidget("user", "User", {
      title: "User",
      position: newPanelPosition(),
    });
  };
  const onClickAssistant = () => {
    addWidget("prompt", "Assistant", {
      title: "Assistant",
      position: newPanelPosition(),
    });
  };

  var sources = [];
  if (community) {
    sources = community.getSources({});
  }

  return (
    <Frame>
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
      <div className="flex flex-col pt-1 px-6">
        {!loading && empty && !orbitImportReady(project) && (
          <p>
            The project has been created. Provide in the settings a workspace
            slug and an API key to import data from Orbit. You can also use
            Panoramicaʼs API to push your data.
          </p>
        )}
        {!loading && empty && orbitImportReady(project) && (
          <div className="flex flex-col space-y-6">
            <p>
              The project has been created. Click the button to fetch data from
              Orbit. This is a one-time operation and takes up to 60 seconds.
            </p>
            <button className="btn" onClick={importProject}>
              Import
            </button>
          </div>
        )}
        {community && !empty && (
          <>
            <div className="flex flex-col items-start space-y-6">
              <div className="flex flex-col items-start space-y-2">
                <form onSubmit={onSearchSubmit} className="flex space-x-2">
                  <input
                    type="search"
                    ref={searchRef}
                    placeholder="Search..."
                  />
                  <button className="btn" type="submit">
                    <FontAwesomeIcon icon="search" />
                  </button>
                </form>
              </div>
              <div className="flex flex-col items-start w-full">
                <div className="text-tertiary pb-1 font-semibold">Explore</div>
                <button
                  onClick={(e) =>
                    onClickSource(e, null, { position: newPanelPosition() })
                  }
                >
                  All Activity
                </button>
                <button
                  onClick={() =>
                    addWidget("members", "Members", {
                      title: "Members",
                      position: newPanelPosition(),
                    })
                  }
                >
                  Member List
                </button>
                <button onClick={onClickAssistant}>Assistant</button>
                <button onClick={onClickBookmarks}>
                  Bookmarks ({bookmarks.length})
                </button>
                <div className="flex flex-col items-start w-full whitespace-nowrap">
                  {bookmarks
                    .map(({ activityId }) =>
                      community.findActivityById(activityId)
                    )
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="group flex items-center space-x-1 w-full text-sm text-left text-gray-400 text-ellipsis cursor-pointer dark:text-gray-500"
                        onClick={(e) =>
                          onClickActivity(e, activity, {
                            position: newPanelPosition(),
                          })
                        }
                      >
                        <SourceIcon activity={activity} className="text-xs" />
                        <div className="group-hover:underline overflow-x-hidden w-full text-ellipsis">
                          {activity.summary || activity.text.slice(0, 50)}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="text-tertiary pb-1 pt-2 font-semibold">
                  Sources
                </div>
                {sources.map((source) => (
                  <div className="flex flex-col" key={source}>
                    <button
                      className="flex items-center space-x-1"
                      onClick={(e) =>
                        onClickSource(e, source, {
                          position: newPanelPosition(),
                        })
                      }
                    >
                      <div>{utils.titleize(source)}</div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start text-gray-400 dark:text-gray-500">
                {project.demo && (
                  <Link
                    target="_blank"
                    href={`/projects/${project.id}/welcome`}
                    prefetch={false}
                    className="hover:underline"
                  >
                    <FontAwesomeIcon icon="arrow-up-right-from-square" /> Public
                    View
                  </Link>
                )}
                <button
                  className="hover:underline"
                  onClick={toggleEditingTheme}
                >
                  Theme
                </button>
                <button
                  className="hover:underline"
                  onClick={onClickEditProject}
                >
                  Settings
                </button>
                {user && (
                  <>
                    <button className="hover:underline" onClick={onClickUser}>
                      API Settings
                    </button>
                  </>
                )}
                <button className="hover:underline" onClick={resetWidgets}>
                  Reset
                </button>
                <Link
                  className="hover:underline"
                  prefetch={false}
                  href={`/dashboard`}
                >
                  Exit
                </Link>
              </div>
            </div>
          </>
        )}
        <div className="my-auto" />
      </div>
      {editingTheme &&
        createPortal(
          <Modal title="Change Theme" close={toggleEditingTheme}>
            <ThemeSelector />
          </Modal>,
          document.body
        )}
    </Frame>
  );
}
