"use client";

import React from "react";
import { signOut, useSession } from "next-auth/react";

import Header from "src/components/ui/SiteHeader";
import New from "src/components/domains/project/New";
import List from "src/components/domains/project/List";

export default function Index({ projects }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <Header />
      <div
        id="container"
        className="flex overflow-scroll flex-col justify-center items-center py-20"
      >
        <div className="flex flex-col items-center space-y-3 w-full font-thin">
          <div className="text-center">
            <h1 className="py-2 text-3xl">panoramica</h1>
            <div className="text-md">
              explore conversational landscapes with AI
            </div>
          </div>
          <div className="flex space-x-4 text-sm">
            <span>Signed in as {user.email}</span>
            <button className="underline" onClick={() => signOut()}>
              Sign out
            </button>
          </div>
          <div className="px-8 py-8 w-1/3">
            <div className="flex flex-col space-y-6 w-full">
              <List
                user={user}
                projects={projects}
                projectUrl={(project) => `/projects/${project.id}`}
              />
              <div className="border-b border-indigo-900" />
              <New redirectUrl={(id) => `/projects/${id}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
