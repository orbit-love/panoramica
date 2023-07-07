"use client";

import React, { useReducer } from "react";
import { Orientation, DockviewReact } from "dockview";

import { components, tabComponents } from "components/skydeck";
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

const projectReducer = (object, { type, community }) => {
  switch (type) {
    case "updated": {
      return { ...object, community };
    }
  }
};

const onReady = (event) => {
  // delete localStorage["dockview_persistance_layout_2"];
  const layoutString = localStorage.getItem("dockview_persistance_layout_2");

  let success = false;
  if (layoutString) {
    try {
      const layout = JSON.parse(layoutString);
      event.api.fromJSON(layout);
      success = true;
    } catch (err) {
      console.log("Could not load layout", err);
    }
  }

  if (!success) {
    event.api.addPanel({
      id: "home",
      component: "Home",
      tabComponent: "Home",
      title: "Home",
    });
    event.api.addPanel({
      id: "all-activity",
      component: "Source",
      tabComponent: "Source",
      title: "All Activity",
      params: {
        source: null,
      },
    });
  }
};

export default function Page({ project, data }) {
  const community = new Community({ result: data, levels });
  const initialObject = { project, community, levels };
  const [object, dispatch] = useReducer(projectReducer, initialObject);

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
