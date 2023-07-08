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
} from "components/skydeck";
import Community from "lib/community";
import Edit from "components/project/edit";

export default function Project({ project, dispatch, levels, api }) {
  const router = useRouter();
  let [status, setStatus] = useState();
  let [loading, setLoading] = useState(false);

  const createEmbeddings = useCallback(async () => {
    postEmbeddings({
      project,
      setLoading,
      onSuccess: () => {
        setStatus("Embeddings created.");
      },
    });
  }, [project, setLoading]);

  const importProject = useCallback(async () => {
    putProjectImport({
      project,
      setLoading,
      onSuccess: () => {
        putProjectProcess({
          project,
          setLoading,
          onSuccess: () => {
            getProject({
              project,
              setLoading,
              onSuccess: ({ result }) => {
                const community = new Community({ result, levels });
                dispatch({ type: "updated", community });
                setStatus("Data reimported.");
              },
            });
          },
        });
      },
    });
  }, [project, dispatch, setLoading, levels]);

  return (
    <Frame api={api}>
      <Scroll>
        <div className="px-4 mt-4">
          {status && <div className="pb-4 text-green-500">{status}</div>}
          <Edit
            project={project}
            onUpdate={(project) => {
              dispatch({ type: "updateProject", project });
              setStatus("Update successful.");
            }}
            onDelete={() => router.push("/skydeck")}
          />
          <div className="flex flex-col items-start py-6 space-y-1 text-indigo-300">
            {loading && (
              <div className="py-4 font-normal text-indigo-600">
                <FontAwesomeIcon icon="circle-notch" spin />
              </div>
            )}
            <span className="text-lg font-thin">Actions</span>
            <button className="hover:underline" onClick={importProject}>
              Reimport Data
            </button>
            <button className="hover:underline" onClick={createEmbeddings}>
              Create Embeddings
            </button>
          </div>
        </div>
      </Scroll>
    </Frame>
  );
}
