import React, { useState, useCallback } from "react";
import classnames from "classnames";

export default function Edit({
  project,
  onUpdate,
  onDelete,
  setLoading,
  setStatus,
}) {
  const [name, setName] = useState(project.name);
  const [url, setUrl] = useState(project.url || "");
  const [workspace, setWorkspace] = useState(project.workspace);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(project.modelName || "");
  const [modelApiKey, setModelApiKey] = useState("");
  const [pineconeApiKey, setPineconeApiKey] = useState("");
  const [pineconeApiEnv, setPineconeApiEnv] = useState(
    project.pineconeApiEnv || ""
  );
  const [pineconeIndexName, setPineconeIndexName] = useState(
    project.pineconeIndexName || ""
  );

  const deleteProject = useCallback(() => {
    const url = `/api/projects/${project.id}/delete`;
    setLoading(true);
    setStatus(null);
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
          onDelete(result);
        } else {
          alert(message);
        }
      });
  }, [project, setLoading, onDelete, setStatus]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const data = {
        url,
        name,
        workspace,
        apiKey,
        modelName,
        modelApiKey,
        pineconeApiKey,
        pineconeApiEnv,
        pineconeIndexName,
      };
      setLoading(true);
      setStatus(null);
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
            setModelApiKey("");
            setPineconeApiKey("");
            setModelApiKey("");
            onUpdate(result.project);
            setLoading(false);
          } else {
            alert(message);
          }
        });
    },
    [
      project,
      setLoading,
      setStatus,
      onUpdate,
      url,
      name,
      workspace,
      apiKey,
      modelName,
      modelApiKey,
      pineconeApiKey,
      pineconeApiEnv,
      pineconeIndexName,
    ]
  );

  return (
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
          placeholder="My Project"
          value={name}
          onChange={({ target }) => setName(target.value)}
        ></input>
      </div>
      <div className="my-2 text-lg font-thin">Activity Data Source</div>
      <div className="flex flex-col space-y-1">
        <div className="">Orbit Workspace</div>
        <input
          type="text"
          required
          placeholder="my-workspace"
          value={workspace}
          onChange={({ target }) => setWorkspace(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="">Orbit API Key (provide to change)</div>
        <input
          type="text"
          value={apiKey}
          onChange={({ target }) => setApiKey(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="">Activities URL (Optional/Advanced)</div>
        <input
          type="text"
          placeholder="https://app.orbit.love/<w>/activities?..."
          value={url}
          onChange={({ target }) => setUrl(target.value)}
        ></input>
      </div>
      <div className="my-2 text-lg font-thin">Language Model Features</div>
      <div className="flex flex-col space-y-1">
        <div className="">Model Name</div>
        <input
          type="text"
          placeholder="gpt-3.5-turbo-0613"
          value={modelName}
          onChange={({ target }) => setModelName(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="">Model API Key (provide to change)</div>
        <input
          type="text"
          value={modelApiKey}
          onChange={({ target }) => setModelApiKey(target.value)}
        ></input>
      </div>
      <div className="my-2 text-lg font-thin">Vector Store Features</div>
      <div className="flex flex-col space-y-1">
        <div className="">Pinecone API Env</div>
        <input
          type="text"
          placeholder="us-east4-gcp"
          value={pineconeApiEnv}
          onChange={({ target }) => setPineconeApiEnv(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="">Pinecone Index Name</div>
        <input
          type="text"
          value={pineconeIndexName}
          onChange={({ target }) => setPineconeIndexName(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <div className="">Pinecone API Key (provide to change)</div>
        <input
          type="text"
          value={pineconeApiKey}
          onChange={({ target }) => setPineconeApiKey(target.value)}
        ></input>
      </div>
      <div className="flex-grow my-auto" />
      <div className="flex space-x-2">
        <button className="btn" type="submit">
          Update
        </button>
        <button
          type="button"
          onClick={() => deleteProject()}
          className={classnames("btn !bg-red-500 !hover:bg-red-400")}
        >
          Delete
        </button>
      </div>
    </form>
  );
}
