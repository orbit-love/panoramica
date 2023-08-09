import React, { useCallback } from "react";
import { putProjectImport, getProject } from "src/data/client/fetches";
import { orbitImportReady } from "src/integrations/ready";

export default function Setup(props) {
  const { project, dispatch, loading, setLoading } = props;

  // const fetchProject = useCallback(async () => {
  //   getProject({
  //     project,
  //     setLoading,
  //     onSuccess: ({ result }) => {
  //       // const community = new Community({ result });
  //       // dispatch({ type: "updated", community });
  //     },
  //   });
  // }, [project, dispatch]);

  const importProject = useCallback(async () => {
    putProjectImport({
      project,
      setLoading,
      onSuccess: () => {},
    });
  }, [project, setLoading]);

  return (
    <div className="flex flex-col">
      {/* {!loading && !orbitImportReady(project) && (
        <p>
          The project has been created. Provide in the settings a workspace slug
          and an API key to import data from Orbit. You can also use
          Panoramicaʼs API to push your data.
        </p>
      )}
      {!loading && orbitImportReady(project) && ( */}
      <div className="flex flex-col space-y-6">
        <p>
          The project has been created. Click the button to fetch data from
          Orbit. This is a one-time operation and takes up to 60 seconds.
        </p>
        <button className="btn" onClick={importProject}>
          Import
        </button>
      </div>
      {/* )} */}
    </div>
  );
}
