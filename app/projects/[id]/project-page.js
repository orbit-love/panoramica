"use client";

import React, { useReducer, useState, useCallback } from "react";
import { Orientation, DockviewReact } from "dockview";
import { useHotkeys } from "react-hotkeys-hook";

import {
  components,
  tabComponents,
  storageKey,
  loadDefaultLayout,
} from "src/components";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/ProjectContext";
import Community from "lib/community";
import levelsData from "data/levels";

const levels = {};
levelsData.forEach((levelData) => {
  levels[levelData.number] = {
    ...levelData,
  };
});

const projectReducer = (object, { type, community, project }) => {
  switch (type) {
    case "updated": {
      return { ...object, community };
    }
    case "updateProject": {
      return { ...object, project };
    }
  }
};

export default function Page({ project, data }) {
  const community = new Community({ result: data, levels });
  const initialObject = { project, community, levels };
  const [object, dispatch] = useReducer(projectReducer, initialObject);
  let [containerApi, setContainerApi] = useState(null);

  const onReady = useCallback(
    (event) => {
      const { api } = event;
      const layoutString = localStorage.getItem(storageKey(project));

      let success = false;
      if (layoutString) {
        try {
          const layout = JSON.parse(layoutString);
          api.fromJSON(layout);
          success = true;
        } catch (err) {
          console.log("Could not load layout", err);
        }
      }

      if (!success) {
        loadDefaultLayout(api);
      }

      setContainerApi(api);
    },
    [project, setContainerApi]
  );

  // the escape key closes the active panel
  useHotkeys(
    "escape",
    () => {
      var activePanel = containerApi.activePanel;
      if (activePanel?.id !== "home") {
        if (activePanel.params.fullscreen) {
          activePanel.api.updateParameters({ fullscreen: false });
        } else {
          activePanel.api.close();
        }
      }
    },
    [containerApi]
  );

  return (
    <ProjectContext.Provider value={object}>
      <ProjectDispatchContext.Provider value={dispatch}>
        <DockviewReact
          components={components}
          tabComponents={tabComponents}
          onReady={onReady}
          orientation={Orientation.HORIZONTAL}
          className="dockview-theme-abyss"
        />
      </ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
}
