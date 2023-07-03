import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";
import { prisma } from "lib/db";

import ProjectPage from "app/skydeck/projects/[id]/project-page";
import Wrapper from "components/wrapper";

export default async function Page({ params }) {
  const props = await getProps(params);
  if (!props.session) {
    redirect("/");
  }

  return (
    <Wrapper session={props.session}>
      <ProjectPage {...props} />
    </Wrapper>
  );
}

export async function getProps(params) {
  const session = await getServerSession(authOptions);
  var _project = null;
  if (session?.user) {
    const { id } = params;
    const user = session.user;
    // check if the user has access
    let where = { id };
    if (!user.admin) {
      where.user = {
        email: user.email,
      };
    }
    _project = await prisma.project.findFirst({
      where,
    });
  }
  if (_project) {
    return {
      session,
      _project,
    };
  }
  return {};
}
