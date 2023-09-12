import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Frame } from "src/components/widgets";
import {
  postEmbeddings,
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
        setStatus("Conversations indexed.");
      },
    });
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
            {aiReady(project) && (
              <button className="hover:underline" onClick={createEmbeddings}>
                Index Conversations
              </button>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}
