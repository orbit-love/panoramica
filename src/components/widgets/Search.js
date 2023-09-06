import React, { useCallback } from "react";

import { Frame, saveLayout } from "src/components/widgets";
import OmniSearch from "../domains/search/OmniSearch";

export default function Search({ project, api, containerApi, handlers }) {
  const initialTerm = api.title === "Search" ? "" : api.title;

  const updateTitle = useCallback(
    (appliedTerm) => {
      if (appliedTerm) {
        api.setTitle(appliedTerm);
        saveLayout({ project, containerApi });
      }
    },
    [project, api, containerApi]
  );

  const onChange = useCallback(
    (appliedTerm) => {
      updateTitle(appliedTerm || "Search");
    },
    [updateTitle]
  );

  return (
    <Frame fullWidth={true}>
      <div className="my-6">
        <OmniSearch
          initialTerm={initialTerm}
          project={project}
          onChange={onChange}
          handlers={handlers}
        ></OmniSearch>
      </div>
    </Frame>
  );
}
