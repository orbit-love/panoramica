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
        <label htmlFor="name">Name</label>
        <input
          type="text"
          required
          placeholder="My Project"
          name="name"
          value={name}
          onChange={({ target }) => setName(target.value)}
        ></input>
      </div>
      <div className="my-2 text-lg font-thin">Activity Data Source</div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="orbit-workspace">Orbit Workspace</label>
        <input
          type="text"
          required
          placeholder="my-workspace"
          name="orbit-workspace"
          value={workspace}
          onChange={({ target }) => setWorkspace(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="orbit-api-key">Orbit API Key (provide to change)</label>
        <input
          type="text"
          name="orbit-api-key"
          value={apiKey}
          onChange={({ target }) => setApiKey(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="orbit-url">Activities URL (Optional/Advanced)</label>
        <input
          type="text"
          placeholder="https://app.orbit.love/<w>/activities?..."
          name="orbit-url"
          value={url}
          onChange={({ target }) => setUrl(target.value)}
        ></input>
      </div>
      <div className="my-2 text-lg font-thin">Language Model Features</div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="model-name">Model Name</label>
        <input
          type="text"
          placeholder="gpt-3.5-turbo-0613"
          name="model-name"
          value={modelName}
          onChange={({ target }) => setModelName(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="model-api-key">Model API Key (provide to change)</label>
        <input
          type="text"
          name="model-api-key"
          value={modelApiKey}
          onChange={({ target }) => setModelApiKey(target.value)}
        ></input>
      </div>
      <div className="my-2 text-lg font-thin">Vector Store Features</div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="pinecone-api-env">Pinecone API Env</label>
        <input
          type="text"
          placeholder="us-east4-gcp"
          name="pinecone-api-env"
          value={pineconeApiEnv}
          onChange={({ target }) => setPineconeApiEnv(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="pinecone-index-name">Pinecone Index Name</label>
        <input
          type="text"
          value={pineconeIndexName}
          name="pinecone-index-name"
          onChange={({ target }) => setPineconeIndexName(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="pinecone-api-key">
          Pinecone API Key (provide to change)
        </label>
        <input
          type="text"
          name="pinecone-api-key"
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
