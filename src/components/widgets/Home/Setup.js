import React, { useCallback, useState } from "react";
import { putProjectImport } from "src/data/client/fetches";
import { orbitImportReady } from "src/integrations/ready";
import Loader from "src/components/domains/ui/Loader";
import { addSourceWidget } from "src/components/widgets/setup/widgets";

export default function Setup({
  project,
  addWidget,
  newPanelPosition,
  refetch,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const importProject = useCallback(async () => {
    putProjectImport({
      project,
      setLoading,
      onSuccess: () => {
        refetch();
        addSourceWidget(null, addWidget, { position: newPanelPosition() });
      },
      onFailure: ({ message }) => {
        setError(message);
      },
    });
  }, [project, setLoading, refetch, addWidget, newPanelPosition]);

  return (
    <div className="flex flex-col space-y-4">
      {!orbitImportReady(project) && (
        <p>
          The project has been created. Provide in the settings a workspace slug
          and an API key to import data from Orbit. You can also use
          Panoramicaʼs API to push your data.
        </p>
      )}
      {orbitImportReady(project) && (
        <div className="flex flex-col space-y-6">
          <p>
            The project has been created. Click the button to fetch data from
            Orbit. This will be done in the background.
          </p>
          <button className="btn" onClick={importProject}>
            {loading && <Loader className="text-white" />}
            {!loading && <div>Import</div>}
          </button>
          {error && <div className="my-4 text-red-500">{error}</div>}
        </div>
      )}
    </div>
  );
}
