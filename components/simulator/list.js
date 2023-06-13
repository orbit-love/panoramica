import React, { useEffect, useState } from "react";

import Show from "components/simulator/show";
import New from "components/simulator/new";
import Edit from "components/simulator/edit";

export default function List({
  sort,
  levels,
  simulation,
  simulations,
  setSimulation,
  setSimulations,
  setSelection,
  community,
  setCommunity,
  low,
  setLow,
  high,
  setHigh,
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
      <div className="flex relative flex-col space-y-4 w-full h-full pointer-events-auto">
        {simulation && !editMode && (
          <Show
            simulation={simulation}
            setSimulation={setSimulation}
            sort={sort}
            levels={levels}
            community={community}
            setCommunity={setCommunity}
            setSelection={setSelection}
            setEditMode={setEditMode}
            low={low}
            setLow={setLow}
            high={high}
            setHigh={setHigh}
          />
        )}
        {simulation && editMode && (
          <Edit
            simulation={simulation}
            setSimulation={setSimulation}
            sort={sort}
            levels={levels}
            setCommunity={setCommunity}
            setSelection={setSelection}
            setEditMode={setEditMode}
          />
        )}
        {!simulation && (
          <>
            <div className="flex flex-col space-y-2">
              <div className="flex items-baseline space-x-2">
                <div className="text-lg font-bold">Choose a Simulation</div>
                {loading && <div className="text-indigo-700">Loading...</div>}
              </div>
              {simulations?.map((simulation) => (
                <div className="flex space-x-4" key={simulation.id}>
                  <button
                    className="text-left underline"
                    onClick={() => {
                      setCommunity(null);
                      setSimulation(simulation);
                      setSelection({ name: "Mission" });
                    }}
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
