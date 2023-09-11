import React from "react";

import { labelActivity } from "./actions";

export default function ActionController({
  project,
  activities,
  setActivities,
  yaml,
  selectedRows,
  setSelectedRows,
  setLoadingRows,
  selectAllCheckboxValue,
  setSelectAllCheckboxValue,
  setRefetchNow,
}) {
  const processActivity = React.useCallback(
    async (activity) => {
      setLoadingRows((loadingRows) => [...loadingRows, activity.id]);
      const newActivity = await labelActivity({
        project,
        activity,
        yaml,
      });
      setActivities((activities) =>
        activities.map((a) => (a.id === activity.id ? newActivity : a))
      );
      setSelectedRows((selectedRows) =>
        selectedRows.filter((id) => id !== activity.id)
      );
      setLoadingRows((loadingRows) =>
        loadingRows.filter((id) => id !== activity.id)
      );
    },
    [project, yaml, setActivities, setSelectedRows, setLoadingRows]
  );

  // sends a message to children that they should process
  // the child's job is to determine if it is selected or not
  const labelSelectedActivities = async ({
    selectedActivities: objects,
    setSelectAllCheckboxValue,
    processActivity: processObject,
  }) => {
    let index = 0;
    let maxConcurrency = 5;
    let activePromises = [];

    async function handlePromise(promise) {
      await promise;
      activePromises = activePromises.filter(
        (activePromise) => activePromise !== promise
      );
    }

    while (index < objects.length || activePromises.length > 0) {
      while (activePromises.length < maxConcurrency && index < objects.length) {
        const promise = processObject(objects[index]);
        activePromises.push(promise);
        handlePromise(promise);
        index += 1;
      }

      if (activePromises.length > 0) {
        await Promise.race(activePromises);
      }
    }

    setSelectAllCheckboxValue(false);
  };

  const activitiesRef = React.useRef();

  React.useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  React.useEffect(() => {
    if (selectAllCheckboxValue) {
      setSelectedRows(activitiesRef.current.map(({ id }) => id));
    } else {
      setSelectedRows([]);
    }
  }, [selectAllCheckboxValue, setSelectedRows]);

  const selectedActivities = selectedRows.map((id) =>
    activities.find((activity) => activity.id === id)
  );

  return (
    <>
      <div>Actions:</div>
      {selectedRows.length > 0 && (
        <div className="flex items-center space-x-2">
          <button
            className="underline"
            onClick={() =>
              labelSelectedActivities({
                selectedActivities,
                setSelectAllCheckboxValue,
                processActivity,
              })
            }
          >
            Label
          </button>
          <div className="text-gray-400">{selectedRows.length} selected</div>
        </div>
      )}
      <div>
        <button
          className="underline"
          onClick={() => setRefetchNow((refetchNow) => refetchNow + 1)}
        >
          Refresh
        </button>
      </div>
    </>
  );
}
