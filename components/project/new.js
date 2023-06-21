import React, { useRef } from "react";
import { useRouter } from "next/router";

import c from "lib/common";

export default function New({}) {
  const router = useRouter();
  const nameRef = useRef(null);
  const urlRef = useRef(null);
  const apiKeyRef = useRef(null);
  const workspaceRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const url = "/api/projects/create";
    const data = {
      url: urlRef.current.value,
      name: nameRef.current.value,
      apiKey: apiKeyRef.current.value,
      workspace: workspaceRef.current.value,
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
        if (result?.project) {
          router.push(`/projects/${result.project.id}`);
        } else {
          alert(message);
        }
      });
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="text-lg font-semibold">Create a New Project</div>
      <div className="text-sm">
        A container for analyzing data from an Orbit workspace.
      </div>
      <div></div>
      <div></div>
      <form
        action="/api/projects/create"
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
          <div className="">Orbit Workspace Id (find in URL)</div>
          <input
            ref={workspaceRef}
            type="text"
            required
            className={c.inputClasses}
            placeholder="my-workspace"
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Orbit API Key</div>
          <input
            ref={apiKeyRef}
            type="text"
            required
            className={c.inputClasses}
            placeholder="obw_abcdefabcdefabcdefabcdef"
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">API URL (Optional/Advanced)</div>
          <input
            ref={urlRef}
            type="text"
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
