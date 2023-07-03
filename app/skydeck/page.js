import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma } from "lib/db";

import SkydeckPage from "app/skydeck/skydeck-page";
import Wrapper from "components/wrapper";

export default async function Page() {
  const props = await getProps();
  if (!props.session) {
    redirect("/");
  }

  return (
    <Wrapper session={props.session}>
      <SkydeckPage {...props} />
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
    var projects = await prisma.project.findMany({
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
      session,
      projects,
    };
  }
  return {};
}
