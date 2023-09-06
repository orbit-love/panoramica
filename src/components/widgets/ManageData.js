import React from "react";

import { Frame } from "src/components/widgets";
import ImportActivities from "src/components/widgets/ManageData/ImportActivities";
import GenerateProperties from "src/components/widgets/ManageData/GenerateProperties";
import { aiReady, orbitImportReady } from "src/integrations/ready";

export default function ManageData({ project }) {
  return (
    <Frame fullWidth>
      <div className="flex flex-col p-4 space-y-4">
        <div className="text-tertiary text-lg font-light">Manage Data</div>
        {orbitImportReady(project) && <ImportActivities project={project} />}
        {aiReady(project) && <GenerateProperties project={project} />}
      </div>
    </Frame>
  );
}
