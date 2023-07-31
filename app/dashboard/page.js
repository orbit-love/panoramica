import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

import { prisma } from "src/data/db";
import DashboardPage from "app/dashboard/DashboardPage";
import SessionContext from "src/components/context/SessionContext";
import { demoSession } from "src/auth";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const props = await getProps();
  if (!props.session) {
    redirect("/");
  }

  return (
    <SessionContext session={props.session}>
      <DashboardPage {...props} />
    </SessionContext>
  );
}

export async function getProps() {
  // if we're running in demo mode, allow the user access to the
  // dashboard of public projects; otherwise deny access
  var session = await getServerSession(authOptions);
  const demoSite = !!process.env.DEMO_SITE;
  if (!session && demoSite) {
    session = demoSession();
  }
  const user = session?.user;
  if (user) {
    let where = {};
    if (!user.admin) {
      where.OR = [
        {
          user: { email: user.email },
        },
      ];
    }
    if (!user.admin && demoSite) {
      where.OR = [
        ...where.OR,
        {
          demo: true,
        },
      ];
    }
    // only select fields we need & no api keys
    const select = {
      id: true,
      name: true,
      user: {
        select: {
          email: true,
        },
      },
    };

    var projects = await prisma.project.findMany({
      select,
      where,
    });

    return {
      demoSite,
      session,
      projects,
    };
  }
  return {};
}
