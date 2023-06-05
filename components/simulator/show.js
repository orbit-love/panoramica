import React, { useRef, useEffect, useState } from "react";

import MemberCollection from "lib/memberCollection";
import MemberReducer from "lib/reducers/member";
import c from "lib/common";

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

export default function Show({
  sort,
  levels,
  members,
  setMembers,
  simulation,
  setSimulation,
  setSelection,
}) {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    const processActivityBatch = async () => {
      const reducer = new MemberReducer();
      for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];
        reducer.reduce(activity);

        if (i % 10 === 0) {
          setMembersFromReducer(reducer);
          setTimestamp(activity.timestamp);
          await timer(100);
        }
      }
      // and once at the end
      setMembersFromReducer(reducer);
    };

    if (activities) {
      processActivityBatch();
    }
  }, [activities]);

  const setMembersFromReducer = (reducer) => {
    reducer.finalize();

    // the result contains members with OL numbers and love
    const rResult = reducer.getResult();

    // now lets get the results ready for display
    const memberCollection = new MemberCollection();
    const membersCollectionRecords = Object.values(rResult).map(
      ({ actor, love, level, activityCount }) => ({
        id: `id-${actor.replace(/[^a-z0-9]/gi, "")}`,
        name: actor.split("#")[0],
        level,
        love,
        activityCount,
        reach: 0.5,
        reset: true,
      })
    );
    memberCollection.list.push(...membersCollectionRecords);
    memberCollection.sort({ sort, levels });
    setMembers(memberCollection);
  };

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
      .then(({ result, message }) => {
        if (result?.count) {
          alert("Imported " + result.count + " activities");
          runSimulation();
        } else {
          alert(message);
        }
        setLoading(false);
      });
  };

  const runSimulation = async () => {
    setLoading(true);
    fetch(`/api/simulations/${simulation.id}/activities`)
      .then((res) => res.json())
      .then(({ result }) => {
        setActivities(result.activities);
        setLoading(false);
      });
  };

  const onClear = () => {
    setSelection(null);
    setTimestamp(null);
    setMembers(new MemberCollection());
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-lg font-bold">{simulation.name}</div>
      {loading && <div className="py-4">Loading...</div>}
      <div className="border-b border-indigo-900" />
      {timestamp && <div>At: {c.formatDate(timestamp)}</div>}
      <div className="py-1">
        <button onClick={() => runSimulation()} className={c.buttonClasses}>
          Run Simulation
        </button>
      </div>
      <div className="py-1">
        <button onClick={onClear} className={c.buttonClasses}>
          Clear
        </button>
      </div>
      <div className="h-4" />
      <div className="flex flex-col space-y-2">
        <div className="my-1 text-lg font-bold">Setup</div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => importSimulation()}
            className={c.buttonClasses}
          >
            Fetch Activities
          </button>
          <div>
            Fetch activities from Orbit and store for analysis; only needs to be
            done once per simulation
          </div>
        </div>
      </div>
      <div className="border-b border-indigo-900" />
      <button onClick={() => setSimulation(null)} className={c.buttonClasses}>
        Back
      </button>
    </div>
  );
}
