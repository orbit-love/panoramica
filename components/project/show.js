import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

import c from "lib/common";
import Community from "lib/community";
import Stats from "lib/community/stats";
import StatsComponent from "components/project/stats";
import ActivitiesSlider from "components/activitiesSlider";

export default function Show({
  sort,
  levels,
  project,
  setEditMode,
  community,
  setCommunity,
  low,
  setLow,
  high,
  setHigh,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cycle, setCycle] = useState(false);
  const [stats, setStats] = useState(null);

  const { cycleDelay, firstCycleDelay } = c.visualization;

  useEffect(() => {
    if (!community) return;
    const eachCycle = () => {
      if (cycle) {
        if (high < community.activities.length) {
          setHigh(high + community.activities.length * 0.1);
        } else {
          setHigh(100);
        }
      }
    };
    const cycleInterval = setInterval(eachCycle, cycleDelay); // wait a little bit (but not 2 seconds) so the user can see the cycling // is happening on page load or when they manually enable cycling
    const timeout = setTimeout(eachCycle, firstCycleDelay);
    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timeout);
    };
  }, [cycle, setCycle, cycleDelay, firstCycleDelay, high, setHigh, community]);

  const fetchProject = useCallback(
    async ({ low, high }) => {
      console.log(`Project fetch started low=${low} high=${high}`);

      var params = "";
      // if a stats are already loaded, we should use low and high to narrow the query
      if (stats && low && high) {
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
            console.log("Error fetching project", message);
          } else {
            const newCommunity = new Community({ result, levels });
            // sort the members before updating
            newCommunity.sortMembers({ sort, levels });
            // put the reset flag on one so the members redraw
            if (newCommunity.members[0]) {
              newCommunity.members[0].reset = true;
            }
            setCommunity(newCommunity);
            setLoading(false);
          }
        });
    },
    [project.id, stats, sort, setCommunity, levels]
  );

  // fetch initially
  useEffect(() => {
    console.log("Fetching project from use effect");
    // fetchProject({ low: 0, high: 0 });
  }, []);

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

  const fetchStats = useCallback(async () => {
    setLoading(true);
    return fetch(`/api/projects/${project.id}/stats`)
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (message) {
          console.log("Error fetching stats", message);
        } else {
          var stats = new Stats({ result });
          setStats(stats);
        }
        setLoading(false);
      });
  }, [project.id, setStats]);

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
          console.log(message);
        } else {
          // set community to null so everything is reset
          setLow(0);
          setHigh(0);
          setCommunity(null);
          await fetchStats();
          await fetchProject({});
        }
        setLoading(false);
      });
  };

  const empty = stats?.activities?.count === 0;
  return (
    <>
      <div className="flex items-baseline space-x-2">
        <span className="text-lg font-bold">Project</span>
        {loading && <div className="text-indigo-700">Loading...</div>}
        <div className="!mx-auto" />
        <span className="text-md">{project.name}</span>
      </div>
      <div className="border-b border-indigo-900" />
      {stats && !empty && (
        <div className="pb-6">
          <ActivitiesSlider
            community={community}
            low={low}
            high={high}
            stats={stats}
            onSliderChange={onSliderChange}
          />
        </div>
      )}
      <div className="flex flex-col space-y-1">
        {empty && !loading && (
          <div className="text-green-500">
            The project has been created. Now, press the Import button to fetch
            data into the project.
          </div>
        )}
        <StatsComponent
          project={project}
          community={community}
          stats={stats}
          setStats={setStats}
          fetchStats={fetchStats}
        />
      </div>
      <div className="flex-grow my-auto" />
      <div className="flex py-2 space-x-2 text-xs">
        <button
          onClick={() => {
            router.push("/");
          }}
          className={c.buttonClasses}
        >
          Back
        </button>
        <button onClick={() => setEditMode(true)} className={c.buttonClasses}>
          Edit
        </button>
        <button onClick={() => importProject()} className={c.buttonClasses}>
          Import
        </button>
        <button onClick={() => processProject()} className={c.buttonClasses}>
          Process
        </button>
      </div>
    </>
  );
}
