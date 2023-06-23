import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { prisma } from "lib/db";
import c from "lib/common";

import Head from "components/head";
import Header from "components/header";
import Button from "components/button";
import Panel from "components/panel";
import New from "components/project/new";

export default function Index({ csrfToken, _projects }) {
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
        <div className="flex flex-col items-center space-y-2 w-full font-thin">
          <h1 className="text-3xl">welcome to telescope</h1>
          {user && (
            <>
              <div className="flex space-x-4 text-sm">
                <span>Signed in as {user.email}</span>
                <button className="underline" onClick={() => signOut()}>
                  Sign out
                </button>
              </div>
              <div className="h-6"></div>
              <Panel className="px-8 py-8 w-1/3">
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
                      <div
                        className="flex justify-between w-full"
                        key={project.id}
                      >
                        <div className="flex space-x-2">
                          <Link
                            prefetch={false}
                            className="underline"
                            href={`/projects/${project.id}`}
                          >
                            <span>{project.name}</span>
                          </Link>
                          <Link
                            prefetch={false}
                            className=""
                            href={`/projects/${project.id}/skydeck`}
                          >
                            <span>🔭</span>
                          </Link>
                        </div>
                        {user.admin && <span>{`${project.user.email}`}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-indigo-900" />
                  <New />
                </div>
              </Panel>
            </>
          )}
          {!user && (
            <div className="py-2">
              <form
                className="flex justify-center space-x-2 w-72"
                method="post"
                action="/api/auth/signin/email"
              >
                <input
                  name="csrfToken"
                  type="hidden"
                  defaultValue={csrfToken}
                />
                <label>
                  <input
                    placeholder="foo@foo.com"
                    className={c.inputClasses + " !w-56"}
                    type="email"
                    id="email"
                    name="email"
                  />
                </label>
                <Button type="submit">Sign in with Email</Button>
              </form>
              <div className="my-4 text-sm text-center">
                Enter your email to receive a secure sign in link.
              </div>
            </div>
          )}
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
  const csrfToken = (await getCsrfToken(context)) || "";
  return {
    props: { session, csrfToken, _projects },
  };
}
