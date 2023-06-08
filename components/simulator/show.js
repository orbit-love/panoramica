import React, { useRef, useEffect, useState, useCallback } from "react";

import MemberCollection from "lib/memberCollection";
import MemberReducer from "lib/reducers/member";
import c from "lib/common";

import Console from "components/simulator/console";
import MultiRangeSlider from "components/multiRangeSlider";

export default function Show({
  sort,
  levels,
  members,
  setMembers,
  simulation,
  setSimulation,
  setSelection,
  setEditMode,
}) {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [cycle, setCycle] = useState(false);

  const { cycleDelay, firstCycleDelay } = c.visualization;

  const onSliderChange = ({ min, max }) => {
    setLow(min);
    setHigh(max);
  };

  useEffect(() => {
    if (!activities) return;
    const eachCycle = () => {
      if (cycle) {
        if (high < activities.length) {
          setHigh(high + activities.length * 0.1);
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
  }, [cycle, setCycle, cycleDelay, firstCycleDelay, high, activities]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    fetch(`/api/simulations/${simulation.id}/activities`)
      .then((res) => res.json())
      .then(({ result }) => {
        setHigh(result.activities.length);
        setActivities(result.activities);
        setLoading(false);
      });
  }, [simulation.id]);

  useEffect(() => {
    if (!activities) {
      fetchActivities();
    }
  }, [activities, fetchActivities]);

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
          alert(message);
        } else {
          fetchActivities();
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!activities) return;

    const processActivitySlice = (activities) => {
      const reducer = new MemberReducer();
      for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];
        reducer.reduce(activity);
      }

      reducer.finalize();

      // the result contains members with OL numbers and love
      const rResult = reducer.getResult();

      const toId = (actor) => `id-${actor.replace(/[^a-z0-9]/gi, "")}`;

      // now lets get the results ready for display
      const memberCollection = new MemberCollection();
      const membersCollectionRecords = Object.values(rResult).map(
        ({ actor, love, reach, level, connections, activityCount }) => ({
          id: toId(actor),
          name: actor.split("#")[0],
          level,
          love,
          reach,
          activityCount,
          connections,
          reset: true,
        })
      );
      membersCollectionRecords.forEach((member) => {
        var expandedConnections = member.connections
          .map((connection) =>
            membersCollectionRecords.find(
              (member) => member.id === toId(connection)
            )
          )
          .filter((e) => e);
        member.connections = expandedConnections.sort(
          (a, b) => a.level - b.level
        );
      });
      memberCollection.list.push(...membersCollectionRecords);
      memberCollection.sort({ sort, levels });
      setMembers(memberCollection);
    };

    processActivitySlice(activities.slice(low, high));
  }, [activities, sort, levels, setMembers, low, high]);

  var slice = activities?.slice(low, high);

  return (
    <>
      {/* {activities && <Console activities={activities} low={low} high={high} />} */}
      <div className="flex flex-col space-y-1">
        <div className="text-lg font-bold">{simulation.name}</div>
        {loading && <div className="py-4">Loading...</div>}
        <div className="border-b border-indigo-900" />
        {activities && activities.length > 0 && (
          <div className="pb-6">
            <MultiRangeSlider
              min={0}
              max={activities.length}
              minCurrent={low}
              maxCurrent={high}
              minLabel={c.formatDateShort(slice[0]?.timestamp)}
              maxLabel={c.formatDateShort(slice[slice.length - 1]?.timestamp)}
              onChange={onSliderChange}
            />
          </div>
        )}
        <div className="flex flex-col py-2">
          {activities?.length === 0 && (
            <div className="text-semibold text-green-500">
              A new simulation has been created. Now, click Import to fetch the
              activities.
            </div>
          )}
          {activities?.length > 0 && slice && (
            <table className="table border-separate [border-spacing:0] text-sm">
              <tbody>
                <tr>
                  <td className="w-24 font-semibold">Activities</td>
                  <td>{slice.length}</td>
                </tr>
                <tr>
                  <td className="w-24 font-semibold">Members</td>
                  <td>
                    {
                      slice
                        .map((activity) => activity.actor)
                        .filter(c.onlyUnique).length
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        <div className="h-2" />
        <div className="flex space-x-2 text-xs">
          <button
            onClick={() => {
              setSelection(null);
              setMembers(new MemberCollection());
              setSimulation(null);
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
        </div>
      </div>
    </>
  );
}
