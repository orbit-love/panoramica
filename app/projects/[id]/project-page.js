"use client";

import React, { useReducer, useState, useCallback, useContext } from "react";
import { Orientation, DockviewReact } from "dockview";
import { useHotkeys } from "react-hotkeys-hook";

import {
  components,
  tabComponents,
  storageKey,
  loadDefaultLayout,
} from "src/components/widgets";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import Community from "src/models/Community";
import WithTheme from "src/components/context/WithTheme";
import { ThemeContext } from "src/components/context/ThemeContext";

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

const Dockview = ({ onReady }) => {
  const { name } = useContext(ThemeContext);
  return (
    <DockviewReact
      components={components}
      tabComponents={tabComponents}
      onReady={onReady}
      orientation={Orientation.HORIZONTAL}
      className={name}
    />
  );
};

export default function ProjectPage({ project, data }) {
  const community = new Community({ result: data });
  const initialObject = { project, community };
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
    <WithTheme>
      <ProjectContext.Provider value={object}>
        <ProjectDispatchContext.Provider value={dispatch}>
          <Dockview onReady={onReady} />
        </ProjectDispatchContext.Provider>
      </ProjectContext.Provider>
    </WithTheme>
  );
}
