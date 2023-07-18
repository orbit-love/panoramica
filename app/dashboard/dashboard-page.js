"use client";

import React from "react";

import SiteHeader from "src/components/ui/SiteHeader";
import New from "src/components/domains/project/New";
import List from "src/components/domains/project/List";
import WithTheme from "src/components/context/WithTheme";

export default function DashboardPage({ projects }) {
  return (
    <WithTheme>
      <SiteHeader />
      <div
        id="container"
        className="flex overflow-scroll flex-col justify-center items-center py-20"
      >
        <div className="flex flex-col items-center space-y-3 w-full">
          <div className="px-8 py-8 w-1/3">
            <div className="flex flex-col space-y-10 w-full">
              {projects.length > 0 && (
                <List
                  projects={projects}
                  projectUrl={(project) => `/projects/${project.id}`}
                />
              )}
              <New redirectUrl={(id) => `/projects/${id}`} />
            </div>
          </div>
        </div>
      </div>
    </WithTheme>
  );
}
