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
  const session = (await getServerSession(authOptions)) || demoSession();
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
    if (!user.admin && process.env.DEMO_SITE) {
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
      demoSite: !!process.env.DEMO_SITE,
      session,
      projects,
    };
  }
  return {};
}
