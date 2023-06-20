import React, { useRef, useState } from "react";
import classnames from "classnames";
import { useRouter } from "next/router";

import c from "lib/common";

export default function Edit({ project, setProject, setEditMode }) {
  const router = useRouter();

  const [name, setName] = useState(project.name);
  const [url, setUrl] = useState(project.url);
  const [apiKey, setApiKey] = useState("");

  const deleteProject = () => {
    const url = `/api/projects/${project.id}/delete`;
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
          router.push("/");
        } else {
          alert(message);
        }
      });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      url,
      name,
      apiKey,
    };
    fetch(`/api/projects/${project.id}/update`, {
      body: JSON.stringify(data),
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ result, message }) => {
        if (result?.project) {
          setProject(result?.project);
          setEditMode(false);
        } else {
          console.log("FAILED", message);
        }
      });
  };

  return (
    <>
      <div className="text-lg font-semibold">Edit Project</div>
      <form
        action="/api/projects/create"
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
            placeholder="My Project"
            value={name}
            onChange={({ target }) => setName(target.value)}
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Orbit Activities Page URL</div>
          <input
            type="text"
            required
            className={c.inputClasses}
            placeholder="https://app.orbit.love/<w>/activities.json?..."
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Orbit API Key (optional, provide to change)</div>
          <input
            type="text"
            className={c.inputClasses}
            placeholder="*********************************"
            value={apiKey}
            onChange={({ target }) => setApiKey(target.value)}
          ></input>
        </div>
        <div className="flex-grow my-auto" />
        <div className="flex pt-2 space-x-2">
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
          <button
            type="button"
            onClick={() => deleteProject()}
            className={classnames(
              c.buttonClasses,
              "bg-red-500 hover:bg-red-400"
            )}
          >
            Delete
          </button>
        </div>
      </form>
    </>
  );
}
