import { prisma } from "lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

export const check = async function (req, res) {
  const session = await getServerSession(req, res, authOptions);
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

export const authorizeProject = async function ({ id, user, res }) {
  let project = await prisma.project.findFirst({
    where: {
      id,
      user: {
        email: user.email,
      },
    },
  });
  if (project) {
    return project;
  } else {
    res.status(401).json({ message: "Not authorized" });
    return null;
  }
};
