"use client";

import React from "react";
import { useSession } from "next-auth/react";

import Header from "src/components/header";
import Panel from "src/components/panel";
import New from "src/components/project/new";
import List from "src/components/project/list";

export default function Index({ projects }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <Header />
      <div
        id="container"
        className="flex overflow-scroll flex-col justify-center items-center py-20 text-indigo-100"
      >
        <div className="flex flex-col items-center space-y-6 w-full font-thin">
          <div className="text-center">
            <h1 className="text-3xl">skydeck [preview]</h1>
            <div className="text-md">keep tabs on your community</div>
          </div>
          <Panel className="px-8 py-8 w-1/3">
            <div className="flex flex-col space-y-6 w-full">
              <List
                user={user}
                projects={projects}
                projectUrl={(project) => `/skydeck/projects/${project.id}`}
              />
              <div className="border-b border-indigo-900" />
              <New redirectUrl={(id) => `/skydeck/projects/${id}`} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
