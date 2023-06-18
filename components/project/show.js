import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

import c from "lib/common";
import Community from "lib/community";
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
    const cycleInterval = setInterval(eachCycle, cycleDelay);
    // wait a little bit (but not 2 seconds) so the user can see the cycling
    // is happening on page load or when they manually enable cycling
    const timeout = setTimeout(eachCycle, firstCycleDelay);
    return () => {
      clearInterval(cycleInterval);
      clearTimeout(timeout);
    };
  }, [cycle, setCycle, cycleDelay, firstCycleDelay, high, setHigh, community]);

  const fetchProject = useCallback(async () => {
    console.log("Project fetch: started");
    var params = "";
    // if a community is already loaded, we should use low and high to narrow the query
    if (community) {
      const { minDate } = community.getActivityDateRange();
      const from = c.addDays(minDate, low).toISOString();
      const to = c.addDays(minDate, high).toISOString();
      params = new URLSearchParams({
        from,
        to,
      });
    }

    // show loading always since it takes a while in prod right now
    setLoading(true);

    // only needed when high was not chosen, otherwise it will be the same
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
  }, [project.id, community, low, high, sort, setCommunity, levels]);

  // fetch initially and if low/high change
  useEffect(() => {
    fetchProject();
  }, [low, high]);

  const importProject = async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/import`, {
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

  const processProject = async () => {
    setLoading(true);
    fetch(`/api/projects/${project.id}/process`, {
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
        } else {
          // set community to null so everything is reset
          setCommunity(null);
          fetchProject();
        }
        setLoading(false);
      });
  };

  const imported = community?.stats.activities.count > 0;
  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="flex items-baseline space-x-2">
        <span className="text-lg font-bold">Project</span>
        {loading && <div className="text-indigo-700">Loading...</div>}
        <div className="!mx-auto" />
        <span className="text-md">{project.name}</span>
      </div>
      <div className="border-b border-indigo-900" />
      {imported && (
        <div className="pb-6">
          <ActivitiesSlider
            community={community}
            low={low}
            setLow={setLow}
            high={high}
            setHigh={setHigh}
          />
        </div>
      )}
      <div className="flex flex-col space-y-2">
        {community && !imported && (
          <div className="text-semibold py-3 text-green-500">
            The project has been created. Now, press the Import button to fetch
            data into the project.
          </div>
        )}
        {community && imported && (
          <table className="table border-separate [border-spacing:0] text-sm">
            <thead>
              <tr>
                <td className="w-1/2 font-semibold"></td>
                <td className="w-24 font-semibold">In View</td>
                <td className="font-semibold">Total</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="w-1/3">Activities</td>
                <td>{community.activities.length}</td>
                <td>{community.stats.activities.count}</td>
              </tr>
              <tr>
                <td className="">Members</td>
                <td>{community.members.length}</td>
                <td>{community.stats.members.count}</td>
              </tr>
              <tr>
                <td className="">Connections</td>
                <td>{community.getConnectionCount()}</td>
                <td>{community.stats.members.connections.count}</td>
              </tr>
              <tr>
                <td className="">Density</td>
                <td>
                  {String(
                    c.round(
                      community.getConnectionCount() / community.members.length
                    )
                  )}
                </td>
                <td>
                  {String(
                    c.round(
                      community.stats.members.connections.count /
                        community.stats.members.count
                    )
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
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
    </div>
  );
}
