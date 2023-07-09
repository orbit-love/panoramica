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
            onDelete={() => router.push("/skydeck")}
          />
          <div className="flex flex-col items-start py-6 space-y-1 text-indigo-300">
            <div className="my-2 text-lg font-thin">Actions</div>
            <button className="hover:underline" onClick={importProject}>
              Reimport data from Orbit
            </button>
            <button className="hover:underline" onClick={createEmbeddings}>
              Load embeddings into vector store
            </button>
          </div>
        </div>
      </Scroll>
    </Frame>
  );
}
