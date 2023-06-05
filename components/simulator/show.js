import React, { useRef, useEffect, useState, useCallback } from "react";

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
  setEditMode,
}) {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [step, setStep] = useState(-1);

  const numSteps = 10;

  const fetchActivities = useCallback(
    async () =>
      fetch(`/api/simulations/${simulation.id}/activities`)
        .then((res) => res.json())
        .then(({ result }) => {
          setActivities(result.activities);
          setLoading(false);
        }),
    [simulation.id]
  );

  const processActivityBatch = (activities) => {
    const reducer = new MemberReducer();
    for (var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      reducer.reduce(activity);
    }

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
      .then(({ result, message }) => {
        if (result?.count) {
          fetchActivities();
        } else {
          alert(message);
        }
        setLoading(false);
      });
  };

  // do what we do for cycle here, turn on/off
  const runSimulation = async () => {
    processActivityBatch(activities);
  };

  const onReset = () => {
    setSelection(null);
    setTimestamp(null);
    setStep(-1);
    setMembers(new MemberCollection());
  };

  const sliceActivitiesForStep = ({ activities, step, numSteps }) => {
    var endSliceAt = Math.floor((activities.length / numSteps) * (step + 1));
    var slice = activities.slice(0, endSliceAt);
    return slice;
  };

  const handleBack = () => {
    if (step > 0) {
      const newStep = step - 1;
      const slice = sliceActivitiesForStep({
        activities,
        step: newStep,
        numSteps,
      });
      processActivityBatch(slice);
      setTimestamp(slice[slice.length - 1]?.timestamp);
      setStep(newStep);
    }
  };

  const handleForward = () => {
    if (step < numSteps) {
      const newStep = step + 1;
      const slice = sliceActivitiesForStep({
        activities,
        step: newStep,
        numSteps,
      });
      processActivityBatch(slice);
      setTimestamp(slice[slice.length - 1]?.timestamp);
      setStep(newStep);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="text-lg font-bold">{simulation.name}</div>
      {loading && <div className="py-4">Loading...</div>}
      <div className="border-b border-indigo-900" />
      {timestamp && <div>From:{c.formatDate(activities[0]?.timestamp)}</div>}
      {timestamp && <div>To: {c.formatDate(timestamp)}</div>}
      <div className="py-2 flex space-x-2">
        <button onClick={() => handleBack()} className={c.buttonClasses}>
          &laquo;
        </button>
        <button onClick={() => handleForward()} className={c.buttonClasses}>
          &raquo;
        </button>
        <button onClick={() => runSimulation()} className={c.buttonClasses}>
          Run
        </button>
        <button onClick={onReset} className={c.buttonClasses}>
          Reset
        </button>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="my-1 text-lg font-bold">Data</div>
        {activities && (
          <table className="table border-separate [border-spacing:0] text-sm">
            <tbody>
              <tr>
                <td className="w-24">Activities</td>
                <td>{activities.length}</td>
              </tr>
              <tr>
                <td className="w-24">First Activity</td>
                <td>{c.formatDate(activities[0]?.timestamp)}</td>
              </tr>
              <tr>
                <td className="w-24">Last Activity</td>
                <td>
                  {c.formatDate(activities[activities.length - 1]?.timestamp)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      <div className="h-1" />
      <div className="flex flex-col space-y-2">
        <div className="my-1 text-lg font-bold">Actions</div>
      </div>
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
        <button onClick={() => importSimulation()} className={c.buttonClasses}>
          Import
        </button>
      </div>
    </div>
  );
}
