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
  const [description, setDescription] = useState(project.description || "");
  const [url, setUrl] = useState(project.url || "");
  const [workspace, setWorkspace] = useState(project.workspace);
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(project.modelName || "");
  const [modelApiKey, setModelApiKey] = useState("");
  const [typesenseUrl, setTypesenseUrl] = useState("");
  const [typesenseApiKey, setTypesenseApiKey] = useState("");
  const [demo, setDemo] = useState(project.demo);

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
        description,
        demo,
        workspace,
        apiKey,
        modelName,
        modelApiKey,
        typesenseUrl,
        typesenseApiKey,
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
            setApiKey("");
            setTypesenseApiKey("");
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
      description,
      workspace,
      apiKey,
      modelName,
      modelApiKey,
      typesenseUrl,
      typesenseApiKey,
      demo,
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

      <div className="flex flex-col space-y-1">
        <label htmlFor="name">Short Description</label>
        <small>
          This will be used to give an overall context to the Assistant
        </small>
        <textarea
          type="text"
          placeholder="My Project makes space cats happy"
          name="description"
          value={description}
          onChange={({ target }) => setDescription(target.value)}
        ></textarea>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          placeholder="My Project"
          className="text-tertiary w-4 h-4 bg-gray-100 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          name="demo"
          id="demo"
          checked={demo}
          onChange={() => setDemo(!demo)}
        ></input>
        <label htmlFor="demo">Make Project Public</label>
      </div>
      <div className="my-2 text-lg font-thin">Activity Data Source</div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="orbit-workspace">Orbit Workspace</label>
        <input
          type="text"
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
          placeholder="gpt-3.5-turbo"
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
      <div className="my-2 text-lg font-thin">Search Features</div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="typesense-url">Typesense URL</label>
        <input
          type="text"
          placeholder="http://localhost:8108"
          name="typesense-url"
          value={typesenseUrl}
          onChange={({ target }) => setTypesenseUrl(target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="typesense-api-key">Typesense API Key</label>
        <input
          type="text"
          value={typesenseApiKey}
          name="typesense-api-key"
          onChange={({ target }) => setTypesenseApiKey(target.value)}
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
