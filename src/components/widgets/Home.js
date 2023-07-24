import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHotkeys } from "react-hotkeys-hook";
import Link from "next/link";

import {
  Frame,
  loadDefaultLayout,
  storageKey,
  putProjectImport,
  putProjectRefresh,
  getProject,
} from "src/components/widgets";
import c from "src/configuration/common";
import Community from "src/models/Community";
import Modal from "src/components/ui/Modal";
import ThemeSelector from "src/components/ui/ThemeSelector";
import Loader from "../domains/ui/Loader";

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

  let { onClickSource } = handlers;
  let [loading, setLoading] = useState(false);
  let [position, setPosition] = useState();
  const [editingTheme, setEditingTheme] = useState(false);

  const toggleEditingTheme = () => {
    setEditingTheme(!editingTheme);
  };

  useEffect(() => {
    if (!containerApi) {
      return;
    }
    const disposable = containerApi.onDidLayoutChange(() => {
      // set position to be where tabs should be opened, either
      // inside the group to the right or in a new group if none exists
      if (containerApi.groups.length > 1) {
        let referenceGroup = containerApi.groups[1];
        setPosition({
          referenceGroup,
          direction: "within",
        });
      } else {
        setPosition({ direction: "right" });
      }
    });

    return () => {
      disposable.dispose();
    };
  }, [project, containerApi]);

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
    localStorage.removeItem(storageKey(project));
    containerApi.clear();
    loadDefaultLayout(containerApi);
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

  const onSearchSubmit = (e) => {
    e.preventDefault();
    var term = searchRef.current.value;
    var id = term ? `search-${term}` : "search";
    addWidget(id, "Search", { title: term || "Search", position });
    searchRef.current.value = "";
    searchRef.current.blur();
  };

  var sources = [];
  if (community) {
    sources = community.getSources({});
  }

  return (
    <Frame>
      <div className="py-2 px-6">
        <div className="flex items-center w-full">
          <div className="text-lg">{project.name}</div>
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
          <div className="mx-1" />
          <button onClick={toggleEditingTheme}>
            <FontAwesomeIcon icon={["fas", "brush"]} />
          </button>
          <div className="mx-1" />
          <button
            className=""
            onClick={() =>
              addWidget("edit-project", "EditProject", {
                title: "Edit Project",
                position,
              })
            }
          >
            <FontAwesomeIcon icon="gear" />
          </button>
        </div>
      </div>
      <div className="flex flex-col px-6">
        {!loading && empty && (
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
                <form onSubmit={onSearchSubmit} className="flex mt-2 space-x-2">
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
                <div className="text-tertiary pb-1 font-light">Explore</div>
                <button onClick={(e) => onClickSource(e, null, { position })}>
                  All Activity
                </button>
                <button
                  onClick={() =>
                    addWidget("members", "Members", {
                      title: "Members",
                      position,
                    })
                  }
                >
                  Member List
                </button>
                <button
                  onClick={() =>
                    addWidget("prompt", "Assistant", {
                      title: "Assistant",
                      position,
                    })
                  }
                >
                  Assistant
                </button>
                <div className="text-tertiary pb-1 pt-2 font-light">
                  Sources
                </div>
                {sources.map((source) => (
                  <div className="flex flex-col" key={source}>
                    <button
                      className="flex items-center space-x-1"
                      onClick={(e) => onClickSource(e, source, { position })}
                    >
                      <div>{c.titleize(source)}</div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <button
                  className="text-tertiary hover:underline"
                  onClick={resetWidgets}
                >
                  Reset
                </button>
                <Link
                  prefetch={false}
                  className="text-tertiary hover:underline"
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
