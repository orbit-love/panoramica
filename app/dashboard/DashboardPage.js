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
      <div className="flex overflow-scroll flex-col justify-center items-center md:py-20">
        <div className="flex flex-col items-center space-y-3 w-full">
          <div className="px-4 py-8 md:w-1/3">
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
