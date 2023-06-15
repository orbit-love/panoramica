import React, { useRef } from "react";

import c from "lib/common";

export default function New({ setSimulation, loadSimulations }) {
  const nameRef = useRef(null);
  const urlRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const url = "/api/simulations/create";
    const data = {
      url: urlRef.current.value,
      name: nameRef.current.value,
    };
    fetch(url, {
      body: JSON.stringify(data),
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (result?.simulation) {
          setSimulation(result.simulation);
        } else {
          alert(message);
        }
      });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-lg font-semibold">Create a New Project</div>
      <form
        action="/api/simulations/create"
        method="post"
        className="flex flex-col space-y-4"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col space-y-1">
          <div className="">Name</div>
          <input
            ref={nameRef}
            type="text"
            required
            className={c.inputClasses}
            placeholder="Project Name"
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Any Activities URL / Saved View</div>
          <input
            ref={urlRef}
            type="text"
            required
            className={c.inputClasses}
            placeholder="https://app.orbit.love/<w>/activities?..."
          ></input>
        </div>
        <div className="pt-2">
          <button type="submit" className={c.buttonClasses}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
