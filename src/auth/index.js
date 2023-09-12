import { prisma } from "src/data/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "src/auth/nextAuthOptions";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const secret = process.env.NEXTAUTH_SECRET;

export const getSession = async () => {
  const demoSite = !!process.env.DEMO_SITE;
  var session = await getServerSession(authOptions);
  if (!session && demoSite) {
    session = demoSession();
  }
  return session;
};

export const demoSession = () => ({
  expire: "1",
  user: {
    id: "0",
    email: "visitor@panoramica.ai",
    fake: true,
  },
});

export const createJWT = function (user) {
  var roles = user.admin ? ["admin"] : [];
  var payload = { sub: user.id, roles };
  return jwt.sign(payload, secret);
};

export const checkJWT = function (req) {
  var authorization;
  // for the app router, req.headers.get is a function
  // for the pages router, req.headers.authorization is the way to retrieve
  if (typeof req.headers.get === "function") {
    authorization = req.headers.get("authorization");
  } else {
    authorization = req.headers.authorization;
  }

  if (!authorization) return;

  const token = authorization.split(" ")[1];

  if (!token) return;

  try {
    const payload = jwt.verify(token, secret);
    return prisma.user.findFirst({ where: { id: payload.id } });
  } catch {
    console.log("JWT is not valid");
  }
};

// res can be null here; if req is null, some errors may appear in the logs
export const check = async function (req, res) {
  const user = checkJWT(req);
  if (user) {
    return user;
  }

  const session =
    (await getServerSession(req, res, authOptions)) || demoSession();
  if (session?.user) {
    return session.user;
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
