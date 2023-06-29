import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { prisma } from "lib/db";

import Head from "components/head";
import Header from "components/header";
import Panel from "components/panel";
import New from "components/project/new";
import List from "components/project/list";

export default function Index({ projects }) {
  const { data: session } = useSession();
  const user = session.user;

  return (
    <>
      <Head />
      <Header />
      <div
        id="container"
        className="flex flex-col justify-center items-center py-20 text-indigo-100"
      >
        <div className="flex flex-col items-center space-y-6 w-full font-thin">
          <div className="text-center">
            <h1 className="text-3xl">telescope [preview]</h1>
            <div className="text-md">see the unseen connections</div>
          </div>
          <Panel className="px-8 py-8 w-1/3">
            <div className="flex flex-col space-y-6 w-full">
              <List
                user={user}
                projects={projects}
                projectUrl={(project) => `/telescope/projects/${project.id}`}
              />
              <div className="border-b border-indigo-900" />
              <New redirectUrl={(id) => `/telescope/projects/${id}`} />
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
  var projects = [];
  if (user) {
    let where = {};
    if (!user.admin) {
      where.user = {
        email: user.email,
      };
    }
    projects = await prisma.project.findMany({
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
    for (let project of projects) {
      delete project.apiKey;
    }
    return {
      props: { session, projects },
    };
  } else {
    return {
      redirect: { destination: "/" },
    };
  }
}
