import React, { useState, useCallback } from "react";
import { Frame } from "src/components/widgets";
import { deleteDocumentation, putDocumentation } from "src/data/client/fetches";
import Loader from "src/components/domains/ui/Loader";
import utils from "src/utils";

export default function EditProject({ project, dispatch }) {
  let [status, setStatus] = useState();
  let [loading, setLoading] = useState(false);
  let [startUrl, setStartUrl] = useState("");
  let [rootUrl, setRootUrl] = useState("");

  const valid =
    utils.stringIsValidHttpUrl(startUrl) &&
    (!rootUrl || utils.stringIsValidHttpUrl(rootUrl));

  const createDocumentationEmbeddings = async () => {
    setStatus("");
    putDocumentation({
      project,
      body: JSON.stringify({
        startUrl: startUrl,
        rootUrl: rootUrl || startUrl,
      }),
      setLoading,
      onSuccess: ({ result }) => {
        setStatus(result);
      },
    });
  };

  const deleteDocumentationEmbeddings = useCallback(async () => {
    setStatus("");
    deleteDocumentation({
      project,
      setLoading,
      onSuccess: ({ result }) => {
        setStatus(result);
      },
    });
  }, [project, setLoading, setStatus]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await createDocumentationEmbeddings();
  };

  return (
    <Frame>
      <div className="px-6 mt-4 mb-6">
        <p className="font-semibold">Embed your product Documentation</p>
        <p className="">
          This will empower the assistant with some understanding of your
          product and enhance the quality of its response.
        </p>

        <form
          method="POST"
          className="flex flex-col mt-4 space-y-4"
          onSubmit={onSubmit}
        >
          {status && <div className="pb-4 text-green-500">{status}</div>}
          {loading && <div className="pb-4">{loading && <Loader />}</div>}

          <div className="flex flex-col space-y-1">
            <label htmlFor="start-url">Start URL</label>
            <small>
              We&apos;ll crawl and embed your documentation starting from this
              URL.
            </small>
            <input
              type="text"
              required
              placeholder="https://docs.my-project.com/introduction"
              name="start-url"
              value={startUrl}
              onChange={({ target }) => setStartUrl(target.value)}
            ></input>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="root-url">Root URL</label>
            <small>
              On each page, we&apos;ll visit linked pages under this root URL.
              You can leave it empty to use the start URL as the root.
            </small>
            <input
              type="text"
              placeholder={startUrl || "https://docs.my-project.com"}
              name="root-url"
              value={rootUrl}
              onChange={({ target }) => setRootUrl(target.value)}
            ></input>
          </div>
          <div>
            <button
              disabled={loading || !valid ? "disabled" : ""}
              className="btn"
              type="submit"
            >
              Embed
            </button>
          </div>
        </form>

        <div className="text-tertiary flex flex-col items-start py-6 space-y-1">
          <div className="flex items-center my-2 space-x-2 text-lg font-thin">
            <div>Actions</div>
          </div>
          <button
            className="hover:underline"
            disabled={loading ? "disabled" : ""}
            onClick={deleteDocumentationEmbeddings}
          >
            Remove current embedding
          </button>
        </div>
      </div>
    </Frame>
  );
}
