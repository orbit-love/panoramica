"use client";

import React, { useReducer } from "react";
import { Orientation, DockviewReact } from "dockview";

import {
  components,
  tabComponents,
  storageKey,
  loadDefaultLayout,
} from "components/skydeck";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "components/ProjectContext";
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

  const onReady = (event) => {
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
  };

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
