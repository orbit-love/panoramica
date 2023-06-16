import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

import Head from "components/head";
import Header from "components/header";
import Button from "components/button";
import Panel from "components/panel";
import New from "components/project/new";

export default function Index() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadProjects = () => {
      setLoading(true);
      const url = "/api/projects";
      fetch(url)
        .then((res) => res.json())
        .then(({ result }) => {
          setProjects(result.projects);
          setLoading(false);
        });
    };
    loadProjects();
  }, []);

  return (
    <>
      <Head />
      <Header />
      <div
        id="container"
        className="space-gradient flex flex-col justify-center items-center text-indigo-100"
        style={{
          height: "100vh",
          marginTop: "0",
        }}
      >
        <div className="flex flex-col items-center space-y-2 w-full font-thin">
          <h1 className="text-3xl">welcome to telescope</h1>
          {session ? (
            <>
              <div className="flex space-x-4 text-sm">
                <span>Signed in as {session.user.email}</span>
                <button className="underline" onClick={() => signOut()}>
                  Sign out
                </button>
              </div>
              <div className="h-6"></div>
              <Panel className="px-8 py-8 w-1/4">
                <div className="flex flex-col space-y-6 w-full">
                  <div className="flex flex-col items-baseline space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <div className="text-lg font-bold">Choose a Project</div>
                      {loading && (
                        <div className="text-indigo-700">Loading...</div>
                      )}
                    </div>
                    {projects?.length === 0 && <div>None</div>}
                    {projects?.map((project) => (
                      <div className="flex space-x-4" key={project.id}>
                        <Link
                          prefetch={false}
                          className="underline"
                          href={`/projects/${project.id}`}
                        >
                          {project.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-indigo-900" />
                  <New />
                </div>
              </Panel>
            </>
          ) : (
            <div className="py-6">
              <Button
                className="w-48 text-xl bg-indigo-700"
                onClick={() => signIn()}
              >
                Sign in
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
