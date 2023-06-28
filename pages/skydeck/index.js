import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { prisma } from "lib/db";
import c from "lib/common";

import Head from "components/head";
import Header from "components/header";
import Panel from "components/panel";
import New from "components/project/new";

export default function Index({ _projects }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState(_projects);

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
    if (session && projects.length === 0) {
      loadProjects();
    }
  }, []);

  const user = session?.user;

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
        <div className="flex flex-col items-center space-y-6 w-full font-thin">
          <div className="text-center">
            <h1 className="text-3xl">skydeck [preview]</h1>
            <div className="text-md">keep tabs on your community</div>
          </div>
          <Panel className="px-8 py-8 w-1/3">
            <div className="flex flex-col space-y-6 w-full">
              <div className="flex flex-col items-baseline space-y-2">
                <div className="flex items-baseline space-x-2">
                  <div className="text-lg font-bold">Choose a Project</div>
                  {loading && <div className="text-indigo-700">Loading...</div>}
                </div>
                {projects?.length === 0 && <div>None</div>}
                {projects?.map((project) => (
                  <div className="flex justify-between w-full" key={project.id}>
                    <div className="flex space-x-2">
                      <Link
                        prefetch={false}
                        className="underline"
                        href={`/skydeck/projects/${project.id}`}
                      >
                        <span>{project.name}</span>
                      </Link>
                    </div>
                    {user.admin && <span>{`${project.user.email}`}</span>}
                  </div>
                ))}
              </div>
              <div className="border-b border-indigo-900" />
              <New redirectUrl={(id) => `skydeck/projects/${id}`} />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const user = session?.user;
  var _projects = [];
  if (user) {
    let where = {};
    if (!user.admin) {
      where.user = {
        email: user.email,
      };
    }
    _projects = await prisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    // don't return any api keys
    for (let project of _projects) {
      delete project.apiKey;
    }
  }
  return {
    props: { session, _projects },
  };
}
