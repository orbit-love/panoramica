import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function New({ redirectUrl }) {
  const router = useRouter();
  const nameRef = useRef(null);
  const urlRef = useRef(null);
  const apiKeyRef = useRef(null);
  const workspaceRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = "/api/projects/create";
    const data = {
      url: urlRef.current?.value,
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
          router.push(redirectUrl(result.project.id));
        } else {
          alert(message);
        }
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-lg font-semibold">Create a New Project</div>
      <div className="text-sm">
        Provide a project name, Orbit workspace, and Orbit API key. This will be
        used to fetch data from the Orbit API and store it in the Panoramica
        project.
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
          <div className="">Project Name</div>
          <input
            ref={nameRef}
            type="text"
            required
            placeholder="My Project"
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Orbit Workspace</div>
          <input
            ref={workspaceRef}
            type="text"
            required
            placeholder="my-workspace"
          ></input>
        </div>
        <div className="flex flex-col space-y-1">
          <div className="">Orbit API Key</div>
          <input
            ref={apiKeyRef}
            type="text"
            required
            placeholder="obw_abcdefabcdefabcdefabcdef"
          ></input>
        </div>
        <div className="pt-2">
          <button className="btn" type="submit">
            {loading && <FontAwesomeIcon icon="circle-notch" spin />}
            {!loading && "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
