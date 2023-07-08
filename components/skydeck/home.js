import React, { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHotkeys } from "react-hotkeys-hook";
import Link from "next/link";

import {
  Frame,
  Header,
  loadDefaultLayout,
  storageKey,
  putProjectImport,
  putProjectProcess,
  putProjectRefresh,
  getProject,
} from "components/skydeck";
import c from "lib/common";
import Community from "lib/community";
import Feed from "lib/community/feed";

export default function Home(props) {
  let searchRef = useRef();
  const {
    project,
    community,
    levels,
    dispatch,
    api,
    containerApi,
    addWidget,
    handlers,
  } = props;

  let { onClickSource } = handlers;
  let [loading, setLoading] = useState(false);

  // put panels in a new group to the right or the leftmost
  // existing group
  let position;
  if (containerApi.groups.length > 1) {
    let referenceGroup = containerApi.groups[1];
    position = {
      referenceGroup,
      direction: "with",
    };
  } else {
    position = { direction: "right" };
  }

  useEffect(() => {
    if (!containerApi) {
      return;
    }
    const disposable = containerApi.onDidLayoutChange(() => {
      const layout = containerApi.toJSON();
      localStorage.setItem(storageKey, JSON.stringify(layout));
      console.log("Layout saved...");
    });

    return () => {
      disposable.dispose();
    };
  }, [containerApi]);

  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      searchRef.current.focus();
    },
    []
  );

  const resetWidgets = useCallback(() => {
    localStorage.removeItem(storageKey);
    containerApi.clear();
    loadDefaultLayout(containerApi);
  }, [containerApi]);

  const fetchProject = useCallback(async () => {
    getProject({
      project,
      setLoading,
      onSuccess: ({ result }) => {
        const community = new Community({ result, levels });
        dispatch({ type: "updated", community });
      },
    });
  }, [project, levels, dispatch]);

  const importProject = useCallback(async () => {
    putProjectImport({
      project,
      setLoading,
      onSuccess: () => {
        putProjectProcess({
          project,
          setLoading,
          onSuccess: () => fetchProject(),
        });
      },
    });
  }, [project, setLoading, fetchProject]);

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    putProjectRefresh({ project, onSuccess: fetchProject });
  }, [project, fetchProject]);

  // refresh the project right away so new data comes in
  useEffect(() => {
    var interval = setInterval(() => {
      refreshProject();
    }, 60 * 1000);
    // refreshProject();
    return () => {
      clearInterval(interval);
    };
  }, [refreshProject]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    var term = searchRef.current.value;
    addWidget("search", "Search", { title: term, initialTerm: term, position });
    searchRef.current.value = "";
    searchRef.current.blur();
  };

  // prepare to render
  const empty = community?.activities?.length === 0;

  var sources = [];
  if (community) {
    var feed = new Feed({ community });
    sources = feed.getSources({});
  }

  return (
    <Frame>
      <Header api={api} remove={null}>
        <div className="flex items-center w-full">
          <div className="text-lg">{project.name}</div>
          <div title="Auto update every 60s">
            <FontAwesomeIcon
              icon="circle"
              className="pl-2 text-sm text-green-600"
            />
          </div>
          {loading && (
            <div className="pl-2 font-normal text-indigo-600">
              <FontAwesomeIcon icon="circle-notch" spin />
            </div>
          )}
          <div className="mx-auto" />
          <button
            className=""
            onClick={() =>
              addWidget("edit-project", "Project", {
                title: "Edit Project",
                position,
              })
            }
          >
            <FontAwesomeIcon icon="gear" />
          </button>
        </div>
      </Header>
      <div className="flex flex-col px-4 h-[92%]">
        {!loading && empty && (
          <div className="flex flex-col space-y-6">
            <p className="text-sm">
              The project has been created. Click the button to fetch data from
              Orbit. This is a one-time operation and takes up to 60 seconds.
            </p>
            <button onClick={() => importProject()} className={c.buttonClasses}>
              Import
            </button>
          </div>
        )}
        {community && !empty && (
          <>
            <div className="flex flex-col items-start space-y-6 w-full">
              <div className="flex flex-col items-start space-y-2 w-full">
                <form
                  onSubmit={onSearchSubmit}
                  className="flex mt-2 space-x-2 w-full"
                >
                  <input
                    className={c.inputClasses}
                    type="search"
                    ref={searchRef}
                    placeholder="Search..."
                  />
                  <button type="submit" className={c.buttonClasses}>
                    <FontAwesomeIcon icon="search" />
                  </button>
                </form>
              </div>
              <div className="flex flex-col items-start w-full">
                <div className="pb-1 font-thin">Explore</div>
                <button onClick={(e) => onClickSource(e, null, { position })}>
                  All Activity
                </button>
                <button
                  onClick={() =>
                    addWidget("members", "Members", {
                      title: "Member List",
                      position,
                    })
                  }
                >
                  Member List
                </button>
                {/* <button
                      className=""
                      onClick={() =>
                        addWidget((props) => <Insights {...props} />)
                      }
                    >
                      Insights
                    </button> */}
                <button
                  onClick={() =>
                    addWidget("prompt", "Prompt", {
                      title: "Prompt",
                      position,
                    })
                  }
                >
                  Prompt
                </button>
                <button
                  onClick={() =>
                    addWidget("entities", "Entities", {
                      title: "Entities",
                      position,
                    })
                  }
                >
                  Entities
                </button>
                <div className="pb-1 pt-2 font-thin">Sources</div>
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
              <button className="text-red-500" onClick={resetWidgets}>
                Reset
              </button>
            </div>
          </>
        )}
        <div className="my-auto" />
        <Link
          prefetch={false}
          className="text-indigo-600 hover:underline"
          href={`/skydeck`}
        >
          <FontAwesomeIcon icon="arrow-left" />
          <span className="px-1">Exit</span>
        </Link>
      </div>
    </Frame>
  );
}
