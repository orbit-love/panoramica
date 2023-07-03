import { prisma } from "lib/db";
import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

import Wrapper from "components/wrapper";
import HomePage from "app/home-page";

export default async function Page() {
  const props = await getProps();
  return (
    <Wrapper session={props.session}>
      <HomePage {...props} />
    </Wrapper>
  );
}

export async function getProps() {
  const session = await getServerSession(authOptions);
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
  const csrfToken = (await getCsrfToken(authOptions)) || "";
  return {
    session,
    csrfToken,
    _projects,
  };
}
