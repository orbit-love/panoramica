import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

import { prisma } from "src/data/db";
import DashboardPage from "app/dashboard/dashboard-page";
import SessionContext from "src/components/context/SessionContext";

export const metadata = {
  title: "Panoramica",
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
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (user) {
    let where = {};
    if (!user.admin) {
      where.user = {
        email: user.email,
      };
    }
    // only select fields we need & no api keys
    var projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return {
      session,
      projects,
    };
  }
  return {};
}
