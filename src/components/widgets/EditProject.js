import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Frame } from "src/components/widgets";
import {
  putProjectImport,
  postEmbeddings,
  putProjectRefresh,
  postCreateActivitiesProperties,
} from "src/data/client/fetches";
import Edit from "src/components/domains/project/Edit";
import Loader from "src/components/domains/ui/Loader";
import { aiReady, orbitImportReady } from "src/integrations/ready";

export default function EditProject({ project, dispatch }) {
  const router = useRouter();
  let [status, setStatus] = useState();
  let [loading, setLoading] = useState(false);

  const createEmbeddings = useCallback(async () => {
    setStatus("");
    postEmbeddings({
      project,
      setLoading,
      onSuccess: () => {
        setStatus("Embeddings created.");
      },
    });
  }, [project, setLoading]);

  const importProject = useCallback(async () => {
    setStatus("");
    putProjectImport({
      project,
      setLoading,
      onSuccess: () => {
        setStatus("Success: data has been re-imported.");
      },
    });
  }, [project, setLoading]);

  const refreshProject = useCallback(async () => {
    setStatus("");
    setLoading(true);
    putProjectRefresh({
      project,
      setLoading,
      onSuccess: () => {
        setStatus("Success: data has been refreshed.");
      },
    });
  }, [project, setLoading]);

  const labelConversations = useCallback(async () => {
    setStatus("");
    var response, cursor;
    try {
      setStatus("Conversation labeling starting...");
      while (!response || cursor) {
        var response = await postCreateActivitiesProperties({
          project,
          setLoading,
          body: JSON.stringify({ cursor }),
          onSuccess: () => {},
        });
        if (response.status !== 200) {
          break;
        }
        var { endCursor } = await response.json();
        cursor = endCursor;
        setStatus("Conversation labeling at " + cursor);
      }
      setStatus("Conversation labeling complete.");
    } catch (e) {
      console.error(e);
      setStatus("Conversation labeling failed.");
    }
  }, [project, setLoading]);

  return (
    <Frame>
      <div className="px-6 mt-4 mb-6">
        {status && <div className="pb-4 text-green-500">{status}</div>}
        {loading && <div className="pb-4">{loading && <Loader />}</div>}
        <Edit
          project={project}
          setLoading={setLoading}
          setStatus={setStatus}
          onUpdate={(project) => {
            dispatch({ type: "updateProject", project });
            setStatus("Update successful.");
          }}
          onDelete={() => router.push("/projects")}
        />

        {(orbitImportReady(project) || aiReady(project)) && (
          <div className="text-tertiary flex flex-col items-start py-6 space-y-1">
            {status && <div className="pb-2 text-green-500">{status}</div>}
            <div className="flex items-center my-2 space-x-2 text-lg font-thin">
              <div>Actions</div>
              {loading && <Loader />}
            </div>
            {orbitImportReady(project) && (
              <>
                <button className="hover:underline" onClick={refreshProject}>
                  Refresh latest data from Orbit
                </button>
                <button className="hover:underline" onClick={importProject}>
                  Reimport all data from Orbit
                </button>
              </>
            )}

            {aiReady(project) && (
              <button className="hover:underline" onClick={createEmbeddings}>
                Index Conversations
              </button>
            )}

            {aiReady(project) && (
              <button className="hover:underline" onClick={labelConversations}>
                Generate conversation properties
              </button>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}
