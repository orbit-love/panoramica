import { prisma } from "src/data/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "src/auth/nextAuthOptions";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const secret = process.env.NEXTAUTH_SECRET;

export const demoSession = () => ({
  expire: "1",
  user: {
    id: "0",
    email: "visitor@panoramica.ai",
    fake: true,
  },
});

const checkJWT = function (req) {
  const authorization = req.headers.authorization || "";

  if (!authorization) {
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.verify(token, secret);
    return prisma.user.findFirst({ where: { id: payload.id } });
  } catch {
    console.log("JWT is not valid");
  }
};

// res can be null here; if req is null, some errors may appear in the logs
export const check = async function (req, res) {
  const session =
    (await getServerSession(req, res, authOptions)) || demoSession();
  if (session?.user) {
    return session.user;
  }

  const user = checkJWT(req);
  if (user) {
    return user;
  }

  res.redirect("/");
  return null;
};

// res can be null here; if req is null, some errors may appear in the logs
export const checkApp = async function () {
  const session = (await getServerSession(authOptions)) || demoSession();
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

export const authorizeProject = async function ({ id, user, allowPublic }) {
  let where = { id };
  if (!user.admin) {
    where.OR = [
      {
        demo: true,
      },
      {
        user: { email: user.email },
      },
    ];
  }
  let project = await prisma.project.findFirst({
    where,
  });

  if (project && (project.userId == user.id || user.admin || allowPublic)) {
    return project;
  }

  NextResponse.json({ message: "Not authorized" }, { status: 401 });
};
