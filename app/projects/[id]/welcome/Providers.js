"use client";

import React, { useReducer } from "react";
import SessionContext from "src/components/context/SessionContext";
import {
  ProjectContext,
  ProjectDispatchContext,
} from "src/components/context/ProjectContext";
import { projectReducer } from "src/reducers";
import Community from "src/models/Community";

import Themed from "src/components/context/Themed";

export default async function Providers({ children, ...props }) {
  const { project, data } = props;
  const community = new Community({ result: data });
  const initialObject = { project, community, prompts: [] };
  const [object, dispatch] = useReducer(projectReducer, initialObject);

  return (
    <Themed>
      <ProjectContext.Provider value={object}>
        <ProjectDispatchContext.Provider value={dispatch}>
          <SessionContext session={props.session}>{children}</SessionContext>
        </ProjectDispatchContext.Provider>
      </ProjectContext.Provider>
    </Themed>
  );
}
