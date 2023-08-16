"use client";

import React, { useReducer } from "react";
import SessionContext from "src/components/context/SessionContext";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import { projectReducer } from "src/reducers";

import Themed from "src/components/context/Themed";

export default async function Providers(props) {
  const { project, session, children } = props || {};
  const initialObject = { project: project || {}, prompts: [] };
  const [object, dispatch] = useReducer(projectReducer, initialObject);

  // guard against strange error we see
  if (!props) {
    return <></>;
  }

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <ProjectDispatchContext.Provider value={dispatch}>
          <SessionContext session={session}>{children}</SessionContext>
        </ProjectDispatchContext.Provider>
      </ProjectContext.Provider>
    </Themed>
  );
}
