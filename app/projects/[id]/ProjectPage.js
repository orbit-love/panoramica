"use client";

import React, {
  useReducer,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { Orientation, DockviewReact } from "dockview";
import { useHotkeys } from "react-hotkeys-hook";

import {
  components,
  tabComponents,
  storageKey,
  loadDefaultLayout,
  saveLayout,
} from "src/components/widgets";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import {
  BookmarksContext,
  BookmarksDispatchContext,
} from "src/components/context/BookmarksContext";
import Themed from "src/components/context/Themed";
import { ThemeContext } from "src/components/context/ThemeContext";
import { projectReducer, bookmarksReducer } from "src/reducers";
import GetBookmarksQuery from "src/graphql/queries/GetBookmarks.gql";

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

export default function ProjectPage({ project }) {
  const initialObject = { project };
  const [object, dispatch] = useReducer(projectReducer, initialObject);

  const { id: projectId } = project;
  const {
    data: {
      users: [
        {
          bookmarksConnection: { edges: bookmarksResult },
        },
      ],
    },
  } = useSuspenseQuery(GetBookmarksQuery, {
    variables: {
      projectId,
    },
  });

  const updatedBookmarks = bookmarksResult.map(
    ({ node: activity, ...props }) => ({
      node: {
        ...activity,
        conversation: {
          ...activity.conversation.descendants[0],
          ...activity.conversation,
        },
      },
      ...props,
    })
  );

  const [bookmarks, bookmarksDispatch] = useReducer(bookmarksReducer, {
    bookmarks: updatedBookmarks,
  });
  const [containerApi, setContainerApi] = useState(null);

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
