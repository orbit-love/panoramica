"use client";

import React, {
  useReducer,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { Orientation, DockviewReact } from "dockview";
import { useHotkeys } from "react-hotkeys-hook";

import {
  components,
  tabComponents,
  storageKey,
  loadDefaultLayout,
  saveLayout,
} from "src/components/widgets";
import { getBookmarks } from "src/data/client/fetches/bookmarks";
import { getPrompts } from "src/data/client/fetches/prompts";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import Community from "src/models/Community";
import Themed from "src/components/context/Themed";
import { ThemeContext } from "src/components/context/ThemeContext";
import { projectReducer, bookmarksReducer } from "src/reducers";

const Dockview = ({ onReady }) => {
  const { dockviewTheme } = useContext(ThemeContext);
  return (
    <DockviewReact
      components={components}
      tabComponents={tabComponents}
      onReady={onReady}
      orientation={Orientation.HORIZONTAL}
      className={dockviewTheme}
    />
  );
};

export default function ProjectPage({ project, data }) {
  const community = new Community({ result: data });
  const initialObject = { project, community, prompts: [] };
  const [object, dispatch] = useReducer(projectReducer, initialObject);

  const [bookmarks, bookmarksDispatch] = useReducer(bookmarksReducer, {
    bookmarks: [],
  });
  const [containerApi, setContainerApi] = useState(null);

  useEffect(() => {
    getBookmarks({
      project,
      onSuccess: ({ result: { bookmarks } }) => {
        bookmarksDispatch({
          type: "setBookmarks",
          bookmarks,
        });
      },
    });
  }, [project, bookmarksDispatch]);

  useEffect(() => {
    getPrompts({
      project,
      onSuccess: ({ result: { prompts } }) => {
        dispatch({
          type: "updatePrompts",
          prompts,
        });
      },
    });
  }, [project, dispatch]);

  const onReady = useCallback(
    (event) => {
      const { api } = event;
      const layoutString = localStorage.getItem(storageKey(project));

      let success = false;
      if (layoutString) {
        try {
          const layout = JSON.parse(layoutString);
          api.fromJSON(layout);
          // if no panels were loaded, load the default layout instead
          if (api.panels.length > 0) {
            success = true;
          }
        } catch (err) {
          console.log("Could not load layout", err);
          localStorage.removeItem(storageKey(project));
        }
      }

      if (!success) {
        loadDefaultLayout(api);
      }

      setContainerApi(api);
    },
    [project, setContainerApi]
  );

  useEffect(() => {
    if (!containerApi) {
      return;
    }
    const disposable = containerApi.onDidLayoutChange(() => {
      saveLayout({ project, containerApi });
    });

    return () => disposable.dispose();
  }, [containerApi, project]);

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
    <Themed>
      <BookmarksContext.Provider value={bookmarks}>
        <BookmarksDispatchContext.Provider value={bookmarksDispatch}>
          <ProjectContext.Provider value={object}>
            <ProjectDispatchContext.Provider value={dispatch}>
              <Dockview onReady={onReady} />
            </ProjectDispatchContext.Provider>
          </ProjectContext.Provider>
        </BookmarksDispatchContext.Provider>
      </BookmarksContext.Provider>
    </Themed>
  );
}
