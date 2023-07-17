import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  Frame,
  Scroll,
  putProjectImport,
  putProjectProcess,
  postEmbeddings,
  getProject,
  putProjectRefresh,
} from "src/components/widgets";
import Community from "src/models/Community";
import Edit from "src/components/domains/project/Edit";

export default function Project({ project, dispatch }) {
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

  const fetchProject = useCallback(async () => {
    getProject({
      project,
      setLoading,
      onSuccess: ({ result }) => {
        const community = new Community({ result });
        dispatch({ type: "updated", community });
        setStatus("Success: data has been updated.");
      },
    });
  }, [project, setLoading, dispatch]);

  const importProject = useCallback(async () => {
    setStatus("");
    putProjectImport({
      project,
      setLoading,
      onSuccess: () => {
        putProjectProcess({
          project,
          setLoading,
          onSuccess: fetchProject,
        });
      },
    });
  }, [project, setLoading, fetchProject]);

  const refreshProject = useCallback(async () => {
    setStatus("");
    setLoading(true);
    putProjectRefresh({
      project,
      setLoading,
      onSuccess: () => {
        getProject({ project, setLoading, onSuccess: fetchProject });
      },
    });
  }, [project, setLoading, fetchProject]);

  return (
    <Frame>
      <div className="px-4 mt-4">
        {status && <div className="pb-4 text-green-500">{status}</div>}
        {loading && (
          <div className="pb-4 font-normal text-indigo-600">
            <FontAwesomeIcon icon="circle-notch" spin />
          </div>
        )}
        <Edit
          project={project}
          setLoading={setLoading}
          setStatus={setStatus}
          onUpdate={(project) => {
            dispatch({ type: "updateProject", project });
            setStatus("Update successful.");
          }}
          onDelete={() => router.push("/")}
        />
        <div className="flex flex-col items-start py-6 space-y-1 text-indigo-300">
          <div className="flex my-2 space-x-2 text-lg font-thin">
            <div>Actions</div>
            {loading && (
              <div className="font-normal text-indigo-600">
                <FontAwesomeIcon icon="circle-notch" spin />
              </div>
            )}
          </div>
          <button className="hover:underline" onClick={importProject}>
            Reimport all data from Orbit
          </button>
          <button className="hover:underline" onClick={refreshProject}>
            Fetch latest data from Orbit
          </button>
          <button className="hover:underline" onClick={createEmbeddings}>
            Load embeddings into vector store
          </button>
        </div>
      </div>
    </Frame>
  );
}
