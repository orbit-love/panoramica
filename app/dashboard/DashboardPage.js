"use client";

import React from "react";

import SiteHeader from "src/components/ui/SiteHeader";
import New from "src/components/domains/project/New";
import List from "src/components/domains/project/List";
import Themed from "src/components/context/Themed";

export default function DashboardPage({ projects }) {
  return (
    <Themed>
      <SiteHeader />
      <div className="flex overflow-scroll flex-col justify-center items-center">
        <div className="flex flex-col items-center space-y-3 w-full">
          <div className="px-6 py-8 sm:w-1/2">
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
    </Themed>
  );
}
