import React, { useEffect } from "react";

import Show from "components/simulator/show";
import Create from "components/simulator/create";

export default function Home({
  sort,
  levels,
  members,
  simulation,
  simulations,
  setSimulation,
  setSimulations,
  setMembers,
  setSelection,
}) {
  const loadSimulations = () => {
    const url = "/api/simulations";
    fetch(url)
      .then((res) => res.json())
      .then(({ result }) => {
        setSimulations(result.simulations);
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
    loadSimulations();
  }, []);

  return (
    <>
      <div className="flex relative flex-col py-4 px-5 space-y-4 pointer-events-auto">
        {simulation && (
          <Show
            simulation={simulation}
            setSimulation={setSimulation}
            sort={sort}
            levels={levels}
            setMembers={setMembers}
            setSelection={setSelection}
          />
        )}
        {!simulation && (
          <>
            {simulations.length > 0 && (
              <>
                <div className="flex flex-col space-y-2">
                  <div className="text-lg font-bold">Load a Simulation</div>
                  {simulations.map((simulation) => (
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
              </>
            )}
            <Create
              setSimulation={setSimulation}
              loadSimulations={loadSimulations}
            />
          </>
        )}
      </div>
    </>
  );
}
