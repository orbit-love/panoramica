import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma } from "lib/db";

import TelescopePage from "app/telescope/telescope-page";
import Wrapper from "components/wrapper";

export const metadata = {
  title: "Telescope",
};

export default async function Page() {
  const props = await getProps();
  if (!props.session) {
    redirect("/");
  }

  return (
    <Wrapper session={props.session}>
      <TelescopePage {...props} />
    </Wrapper>
  );
}

export async function getProps() {
  const session = await getServerSession(authOptions);
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
      session,
      projects,
    };
  }
  return {};
}
