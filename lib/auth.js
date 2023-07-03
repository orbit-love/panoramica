import { prisma } from "lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/route";

export const check = async function () {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return session.user;
  } else {
    res.redirect("/");
    return null;
  }
};

export const redirect = async function (res) {
  res.redirect("/");
};

export const authorizeProject = async function ({ id, user }) {
  let where = { id };
  if (!user.admin) {
    where.user = {
      email: user.email,
    };
  }
  let project = await prisma.project.findFirst({
    where,
  });
  if (project) {
    return project;
  } else {
    // don't pass res if caller is handling this
    NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }
};
