import React, { useState } from "react";
import { Frame } from "src/components/widgets";
import Loader from "src/components/domains/ui/Loader";
import NewQasWebSource from "./NewQasWebSource";
import NewQasMarkdownSource from "./NewQasMarkdownSource";
import NewQasConversationsSource from "./NewQasConversationsSource";
import { postQas } from "src/data/client/fetches";

export default function NewQasSource({ project, _ }) {
  let [type, setType] = useState("web");
  let [status, setStatus] = useState();
  let [sourceName, setSourceName] = useState("");
  let [specificFields, setSpecificFields] = useState({});
  let [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const body = JSON.stringify({
      type,
      sourceName,
      specificFields,
    });
    postQas({
      project,
      body,
      setLoading,
      onSuccess: () =>
        setStatus("Your source is being processed in the background"),
    });
  };

  const onChange = (field, value) => {
    setSpecificFields((specificFields) => {
      const data = {};
      data[field] = value;
      return {
        ...specificFields,
        ...data,
      };
    });
  };

  return (
    <Frame>
      <div className="px-6 mt-4 mb-6">
        <h2 className="text-lg font-semibold">Add a new Source of QAs</h2>
        <form
          method="POST"
          className="flex flex-col mt-4 space-y-4"
          onSubmit={onSubmit}
        >
          {status && <div className="pb-4 text-green-500">{status}</div>}
          {loading && <div className="pb-4">{loading && <Loader />}</div>}

          <div className="flex flex-col space-y-1">
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="web">Web pages</option>
              <option value="markdown">Markdown</option>
              <option value="conversations">Conversations</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="source-name">Source name</label>
            <small>Unique name for the source</small>
            <input
              type="text"
              required
              placeholder={
                {
                  web: "Product Documentation",
                  markdown: "Custom notes",
                  conversations: "Support conversations",
                }[type] || "Product Documentation"
              }
              name="source-name"
              value={sourceName}
              onChange={({ target }) => setSourceName(target.value)}
            ></input>
          </div>

          {type === "web" && (
            <NewQasWebSource
              specificFields={specificFields}
              onChange={onChange}
            />
          )}
          {type === "markdown" && (
            <NewQasMarkdownSource
              specificFields={specificFields}
              onChange={onChange}
            />
          )}
          {type === "conversations" && (
            <NewQasConversationsSource
              project={project}
              specificFields={specificFields}
              onChange={onChange}
            />
          )}

          <div className="flex flex-col space-y-1"></div>
          <div>
            <button
              disabled={loading ? "disabled" : ""}
              className="btn"
              type="submit"
            >
              Process
            </button>
          </div>
        </form>
      </div>
    </Frame>
  );
}
