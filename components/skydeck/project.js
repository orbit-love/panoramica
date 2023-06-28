import React, { useState, useEffect, useCallback } from "react";
import { Frame, Scroll, Header } from "components/skydeck";
import { useRouter } from "next/router";
import c from "lib/common";

import Edit from "components/project/edit";

export default function Project(props) {
  const router = useRouter();
  let { project, setProject, remove } = props;

  return (
    <Frame>
      <Header {...props}>
        <div>Edit Project</div>
      </Header>
      <Scroll>
        <div className="px-4">
          <Edit
            project={project}
            onUpdate={(project) => {
              setProject(project);
              remove();
            }}
            onDelete={() => router.push("/skydeck")}
          />
        </div>
      </Scroll>
    </Frame>
  );
}
