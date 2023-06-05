import React, { useRef, useState } from "react";

import c from "lib/common";

export default function Edit({ simulation, setSimulation, setEditMode }) {
  const [name, setName] = useState(simulation.name);
  const [url, setUrl] = useState(simulation.url);

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      url,
      name,
    };
    fetch(`/api/simulations/${simulation.id}/update`, {
      body: JSON.stringify(data),
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (result?.simulation) {
          setSimulation(result.simulation);
          setEditMode(false);
        } else {
          alert(message);
        }
      });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-lg font-semibold">Update Simulation</div>
      <form
        action="/api/simulations/create"
        method="post"
        className="flex flex-col space-y-4"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col space-y-1">
          <div className="">Name</div>
          <input
            type="text"
            required
            className={c.inputClasses}
            placeholder="My Simulation"
            value={name}
            onChange={({ target }) => setName(target.value)}
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Activities API URL</div>
          <input
            type="text"
            required
            className={c.inputClasses}
            placeholder="https://app.orbit.love/<w>/activities.json?..."
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          ></input>
        </div>
        <div className="flex space-x-2 pt-2">
          <button
            type="button"
            onClick={() => setEditMode(false)}
            className={c.buttonClasses}
          >
            Back
          </button>
          <button type="submit" className={c.buttonClasses}>
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
