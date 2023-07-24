import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Frame } from "src/components/widgets";
import {
  putProjectImport,
  postEmbeddings,
  getProject,
  putProjectRefresh,
} from "src/data/client/fetches";
import Community from "src/models/Community";
import Edit from "src/components/domains/project/Edit";
import Loader from "src/components/domains/ui/Loader";

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
      onSuccess: fetchProject,
    });
  }, [project, setLoading, fetchProject]);

  const refreshProject = useCallback(async () => {
    setStatus("");
    setLoading(true);
    putProjectRefresh({
      project,
      setLoading,
      onSuccess: fetchProject,
    });
  }, [project, setLoading, fetchProject]);

  return (
    <Frame>
      <div className="px-6 mt-4">
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
          onDelete={() => router.push("/")}
        />
        <div className="text-tertiary flex flex-col items-start py-6 space-y-1">
          <div className="flex items-center my-2 space-x-2 text-lg font-thin">
            <div>Actions</div>
            {loading && <Loader />}
          </div>
          <button className="hover:underline" onClick={refreshProject}>
            Import latest data from Orbit
          </button>
          <button className="hover:underline" onClick={importProject}>
            Reimport all data from Orbit
          </button>
          <button className="hover:underline" onClick={createEmbeddings}>
            Load embeddings into vector store
          </button>
        </div>
      </div>
    </Frame>
  );
}
