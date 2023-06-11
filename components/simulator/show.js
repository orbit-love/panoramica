import React, { useEffect, useState, useCallback } from "react";

import c from "lib/common";
import Community from "lib/community";
import ActivitiesSlider from "components/activitiesSlider";

export default function Show({
  sort,
  levels,
  simulation,
  setSimulation,
  setSelection,
  setEditMode,
  community,
  setCommunity,
  low,
  setLow,
  high,
  setHigh,
}) {
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

  const fetchCommunity = useCallback(async () => {
    setLoading(true);
    // send low and high
    fetch(
      `/api/simulations/${simulation.id}/community?` +
        new URLSearchParams({
          low,
          high,
        })
    )
      .then((res) => res.json())
      .then(({ result }) => {
        const community = new Community({ result, levels });
        // sort the members before updating
        community.sortMembers({ sort, levels });
        // put the reset flag on one so the members redraw
        if (community.members[0]) {
          community.members[0].reset = true;
        }
        // only needed when high was not chosen, otherwise it will be thesame
        setHigh(community.activities.length);
        setCommunity(community);
        setLoading(false);
      });
  }, [
    simulation.id,
    low,
    high,
    sort,
    setHigh,
    setLoading,
    setCommunity,
    levels,
  ]);

  // fetch initially and if low/high change
  useEffect(() => {
    fetchCommunity();
  }, [low, high]);

  const importSimulation = async () => {
    setLoading(true);
    fetch(`/api/simulations/${simulation.id}/import`, {
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
          processSimulation();
        }
      });
  };

  const processSimulation = async () => {
    setLoading(true);
    fetch(`/api/simulations/${simulation.id}/process`, {
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
          fetchCommunity();
        }
        setLoading(false);
      });
  };

  return (
    <>
      <div className="flex flex-col space-y-1">
        <div className="text-lg font-bold">{simulation.name}</div>
        {loading && <div className="py-4">Loading...</div>}
        <div className="border-b border-indigo-900" />
        {community?.activities.length > 0 && (
          <div className="pb-6">
            <ActivitiesSlider
              activities={community.activities}
              low={low}
              setLow={setLow}
              high={high}
              setHigh={setHigh}
            />
          </div>
        )}
        <div className="flex flex-col py-2">
          {community?.activities.length === 0 && (
            <div className="text-semibold text-green-500">
              This simulation has no activities available yet. Choose Import or
              Process.
            </div>
          )}
          {community?.activities.length > 0 && (
            <table className="table border-separate [border-spacing:0] text-sm">
              <tbody>
                <tr>
                  <td className="w-24 font-semibold">Activities</td>
                  <td>{community.activities.length}</td>
                </tr>
                <tr>
                  <td className="w-24 font-semibold">Members</td>
                  <td>{community.members.length}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="h-2" />
        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => {
              setCommunity(null);
              setSimulation(null);
              setSelection(null);
              setLow(0);
              setHigh(0);
            }}
            className={c.buttonClasses}
          >
            Back
          </button>
          <button onClick={() => setEditMode(true)} className={c.buttonClasses}>
            Edit
          </button>
          <button
            onClick={() => importSimulation()}
            className={c.buttonClasses}
          >
            Import
          </button>
          <button
            onClick={() => processSimulation()}
            className={c.buttonClasses}
          >
            Process
          </button>
        </div>
      </div>
    </>
  );
}
