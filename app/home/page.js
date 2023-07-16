import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma } from "lib/db";

import DashboardPage from "app/skydeck/skydeck-page";
import Wrapper from "components/wrapper";

export const metadata = {
  title: "Skydeck",
};

export default async function Page() {
  const props = await getProps();
  if (!props.session) {
    redirect("/");
  }

  return (
    <Wrapper session={props.session}>
      <DashboardPage {...props} />
    </Wrapper>
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
