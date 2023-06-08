import React, { useEffect, useState } from "react";

import Show from "components/simulator/show";
import New from "components/simulator/new";
import Edit from "components/simulator/edit";

export default function Home({
  sort,
  levels,
  simulation,
  simulations,
  setSimulation,
  setSimulations,
  setMembers,
  setSelection,
}) {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const loadSimulations = () => {
    setLoading(true);
    const url = "/api/simulations";
    fetch(url)
      .then((res) => res.json())
      .then(({ result }) => {
        setSimulations(result.simulations);
        setLoading(false);
      });
  };

  const deleteSimulation = (simulation) => {
    const url = `/api/simulations/${simulation.id}/delete`;
    fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (result === "deleted") {
          loadSimulations();
        } else {
          alert(message);
        }
      });
  };

  useEffect(() => {
    if (!simulation) {
      loadSimulations();
    }
  }, [simulation]);

  return (
    <>
      <div className="flex relative flex-col py-4 px-5 space-y-4 w-full pointer-events-auto">
        {simulation && !editMode && (
          <Show
            simulation={simulation}
            setSimulation={setSimulation}
            sort={sort}
            levels={levels}
            setMembers={setMembers}
            setSelection={setSelection}
            setEditMode={setEditMode}
          />
        )}
        {simulation && editMode && (
          <Edit
            simulation={simulation}
            setSimulation={setSimulation}
            sort={sort}
            levels={levels}
            setMembers={setMembers}
            setSelection={setSelection}
            setEditMode={setEditMode}
          />
        )}
        {!simulation && (
          <>
            <div className="flex flex-col space-y-2">
              <div className="text-lg font-bold">Choose a Simulation</div>
              {loading && <div className="py-4">Loading...</div>}
              {simulations?.map((simulation) => (
                <div className="flex space-x-4" key={simulation.id}>
                  <button
                    className="text-left underline"
                    onClick={() => setSimulation(simulation)}
                  >
                    {simulation.name}
                  </button>
                  <button
                    className="text-left text-red-500 underline"
                    onClick={() => deleteSimulation(simulation)}
                  >
                    delete
                  </button>
                </div>
              ))}
            </div>
            <div className="border-b border-indigo-900" />
            <New
              setSimulation={setSimulation}
              loadSimulations={loadSimulations}
            />
          </>
        )}
      </div>
    </>
  );
}
