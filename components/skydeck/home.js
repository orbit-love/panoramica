import React, { useState, useEffect, useCallback, useRef } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import { useHotkeys } from "react-hotkeys-hook";
import c from "lib/common";

import Feed from "lib/community/feed";
import Stats from "lib/community/stats";
import Community from "lib/community";
import { Source, Search, Entities, Members, Project } from "components/skydeck";
import SourceIcon from "components/compact/source_icon";
import ActivitiesSlider from "components/activitiesSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home(props) {
  let searchRef = useRef();
  let { project, community, setCommunity, levels, addWidget, resetWidgets } =
    props;

  const [loading, setLoading] = useState(null);
  const [stats, setStats] = useState(null);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);

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

  // the sequence is
  // stats component fetches stats
  // that updates the slider
  // the slider updates low/high which triggers a project fetch
  const fetchStats = useCallback(async () => {
    setLoading(true);
    return fetch(`/api/projects/${project.id}/stats`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          alert(message);
        } else {
          var stats = new Stats({ result });
          setStats(stats);
        }
        setLoading(false);
      });
  }, [project.id, setStats]);

  const fetchProject = useCallback(
    async ({ low, high }) => {
      console.log(`Project fetch started low=${low} high=${high}`);

      var params = "";
      // if a stats are already loaded, we should use low and high to narrow the query
      if (stats && (low || high)) {
        const { minDate } = stats.getActivityDayRange();
        const from = c.addDays(minDate, low).toISOString();
        const to = c.addDays(minDate, high).toISOString();
        params = new URLSearchParams({
          from,
          to,
        });
      }

      // show loading always since it takes a while in prod right now
      setLoading(true);

      // send low and high
      fetch(`/api/projects/${project.id}?` + params)
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
    },
    [project.id, stats, setCommunity, levels]
  );

  // refetch when the slider changes
  const onSliderChange = async ({ low, high }) => {
    // if high is 0 it means we're still initiatlizing, so don't
    // do anything; onSliderChange will fire only the proper max value is
    // set due to the fetchStats call
    if (!community || high !== 0) {
      fetchProject({ low, high });
      setLow(low);
      setHigh(high);
    }
  };

  // do only on mount
  useEffect(() => {
    fetchStats();
  }, []);

  var sources = [];
  if (community) {
    var feed = new Feed(props);
    sources = feed.getSources({ activities: community.activities });
  }

  const importProject = async () => {
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
  };

  const onDataAvailable = async () => {
    // set community to null so everything is reset
    setLow(0);
    setHigh(0);
    setCommunity(null);
    await fetchStats();
    await fetchProject({});
  };

  const processProject = async () => {
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
  };

  // const refreshProject = async () => {
  //   setLoading(true);
  //   return fetch(`/api/projects/${project.id}/refresh`, {
  //     method: "PUT",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then(async ({ message }) => {
  //       if (message) {
  //         alert(message);
  //       } else {
  //         onDataAvailable();
  //       }
  //       setLoading(false);
  //     });
  // };

  let onSearchSubmit = (e) => {
    e.preventDefault();
    var term = searchRef.current.value;
    addWidget((props) => <Search term={term} {...props} />);
    searchRef.current.value = "";
    searchRef.current.blur();
  };

  const empty = stats?.activities?.count === 0;

  return (
    <Frame>
      <Header {...props} remove={null}>
        <div className="flex w-full">
          <div>{project.name}</div>
          <div className="mx-auto" />
          <button className="" onClick={editProject}>
            <FontAwesomeIcon icon="gear" />
          </button>
        </div>
      </Header>
      <Scroll>
        <div className="flex flex-col px-4 w-[300px] h-full">
          {loading && <div className="pb-3 text-indigo-600">Loading...</div>}
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
          {stats && !empty && (
            <>
              <div className="flex flex-col items-start space-y-1">
                <div className="relative pb-12 w-full">
                  <ActivitiesSlider
                    community={community}
                    low={low}
                    high={high}
                    stats={stats}
                    onSliderChange={onSliderChange}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start space-y-1">
                <div className="text-lg font-semibold">Add Columns</div>
                <button
                  className=""
                  onClick={() => addWidget((props) => <Members {...props} />)}
                >
                  Member List
                </button>
                <button
                  className=""
                  onClick={() => addWidget((props) => <Entities {...props} />)}
                >
                  Entities
                </button>
                <button
                  className=""
                  onClick={() =>
                    addWidget((props) => (
                      <Source source={null} title="All Activities" {...props} />
                    ))
                  }
                >
                  All Activities
                </button>
                {sources.map((source) => (
                  <button
                    key={source}
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
                ))}
                <button className="text-red-500" onClick={resetWidgets}>
                  Reset
                </button>
              </div>
              <div className="h-4" />
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
              Refresh Data
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
