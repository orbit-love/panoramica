import React, { useState, useEffect, useCallback, useRef } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import { useHotkeys } from "react-hotkeys-hook";
import c from "lib/common";

import Feed from "lib/community/feed";
import Community from "lib/community";
import {
  Source,
  Search,
  Entities,
  Members,
  Project,
  Insights,
} from "components/skydeck";
import { addChannelWidget } from "components/skydeck";
import SourceIcon from "components/compact/source_icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home(props) {
  let searchRef = useRef();
  let { project, community, setCommunity, levels, addWidget, resetWidgets } =
    props;

  const [loading, setLoading] = useState(null);

  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      searchRef.current.focus();
    },
    []
  );

  const editProject = useCallback(() => {
    addWidget((props) => <Project {...props} />);
  }, [addWidget]);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        console.log("Project fetch: finished");
        if (message) {
          alert(message);
        } else {
          const newCommunity = new Community({ result, levels });
          setCommunity(newCommunity);
          setLoading(false);
        }
      });
  }, [project, setCommunity, levels]);

  const onDataAvailable = useCallback(async () => {
    await fetchProject();
  }, [fetchProject]);

  const processProject = useCallback(async () => {
    setLoading(true);
    return fetch(`/api/projects/${project.id}/process`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(async ({ message }) => {
        if (message) {
          alert(message);
        } else {
          await onDataAvailable();
        }
        setLoading(false);
      });
  }, [project, setLoading, onDataAvailable]);

  const importProject = useCallback(async () => {
    setLoading(true);
    return fetch(`/api/projects/${project.id}/import`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ message }) => {
        if (message) {
          console.log(message);
          setLoading(false);
        } else {
          processProject();
        }
      });
  }, [project, processProject, setLoading]);

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    return fetch(`/api/projects/${project.id}/refresh`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(async ({ message }) => {
        if (message) {
          // just log to not be annoying
          console.log(message);
        } else {
          onDataAvailable();
        }
      });
  }, [project, onDataAvailable]);

  // fetch the project the first time and then set up polling
  // also refresh the project right away so new data comes in
  useEffect(() => {
    fetchProject();
    var interval = setInterval(() => {
      refreshProject();
    }, 60 * 1000);
    refreshProject();
    return () => {
      clearInterval(interval);
    };
  }, []);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    var term = searchRef.current.value;
    addWidget((props) => <Search term={term} {...props} />);
    searchRef.current.value = "";
    searchRef.current.blur();
  };

  // prepare to render
  const empty = community?.activities?.length === 0;

  var sources = [];
  var sourceChannels = {};
  if (community) {
    var feed = new Feed(props);
    sources = feed.getSources({});
    for (let source of sources) {
      sourceChannels[source] = feed.getSourceChannels({ source });
    }
  }

  console.log("Rendering HOME column");

  return (
    <Frame>
      <Header {...props} remove={null}>
        <div className="flex items-center w-full">
          <div className="text-lg">{project.name}</div>
          <div title="Auto update every 60s">
            <FontAwesomeIcon
              icon="circle"
              className="pl-2 text-sm text-green-600"
            />
          </div>
          {loading && (
            <div className="pl-2 font-normal text-indigo-600">Loading...</div>
          )}
          <div className="mx-auto" />
          <button className="" onClick={editProject}>
            <FontAwesomeIcon icon="gear" />
          </button>
        </div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4 w-[300px] h-full">
          {!loading && empty && (
            <div className="flex flex-col space-y-6">
              <p className="">
                The project has been created. Click the button to fetch data
                from Orbit. This is a one-time operation and takes up to 60
                seconds.
              </p>
              <button
                onClick={() => importProject()}
                className={c.buttonClasses}
              >
                Import
              </button>
            </div>
          )}
          {community && !empty && (
            <>
              <div className="flex flex-col items-start space-y-4">
                <div>
                  <div className="mb-1 font-semibold">Add Columns</div>
                  <div className="flex flex-col items-start w-full">
                    <button
                      className=""
                      onClick={() =>
                        addWidget((props) => (
                          <Source
                            source={null}
                            title="All Activity"
                            {...props}
                          />
                        ))
                      }
                    >
                      All Activity
                    </button>
                    <button
                      className=""
                      onClick={() =>
                        addWidget((props) => <Members {...props} />)
                      }
                    >
                      Member List
                    </button>
                    <button
                      className=""
                      onClick={() =>
                        addWidget((props) => <Insights {...props} />)
                      }
                    >
                      Insights
                    </button>
                    <button
                      className=""
                      onClick={() =>
                        addWidget((props) => <Entities {...props} />)
                      }
                    >
                      Entities
                    </button>
                    {sources.map((source) => (
                      <div className="flex flex-col my-1" key={source}>
                        <button
                          className="flex items-center space-x-1"
                          onClick={() =>
                            addWidget((props) => (
                              <Source
                                source={source}
                                title={c.titleize(source)}
                                {...props}
                              />
                            ))
                          }
                        >
                          <SourceIcon activity={{ source }} />
                          <div>{c.titleize(source)}</div>
                        </button>
                        <div className="flex flex-col items-start pl-2 text-sm text-indigo-400">
                          {sourceChannels[source]
                            .sort(c.sortChannels)
                            .slice(0, 10)
                            .map((channel) => (
                              <button
                                key={channel}
                                onClick={() =>
                                  addChannelWidget(source, channel, addWidget)
                                }
                              >
                                {c.displayChannel(channel)}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                    <button className="text-red-500" onClick={resetWidgets}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-8" />
              <div className="flex flex-col items-start space-y-2">
                <div className="font-semibold">Add a Search</div>
                <form onSubmit={onSearchSubmit} className="flex space-x-2">
                  <input
                    className={c.inputClasses}
                    type="search"
                    ref={searchRef}
                  />
                  <button type="submit" className={c.buttonClasses}>
                    Submit
                  </button>
                </form>
              </div>
            </>
          )}
          <div className="!my-auto"></div>
          <div className="flex flex-col items-start space-y-1 text-sm text-indigo-300">
            <span className="font-bold">Actions</span>
            <button className="" onClick={importProject}>
              Reimport Data
            </button>
          </div>
          <div className="flex flex-col py-6 space-y-1 text-sm text-indigo-300">
            <span className="font-bold">Shortcuts</span>
            <span>/: Search</span>
            <span>Backspace: Remove last column</span>
            <span>Escape: Reset columns</span>
          </div>
        </div>
      </Scroll>
    </Frame>
  );
}
