import { prisma } from "src/data/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "src/auth/nextAuthOptions";
import { NextResponse } from "next/server";

// res can be null here; if req is null, some errors may appear in the logs
export const check = async function (req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user) {
    return session.user;
  } else {
    res.redirect("/");
    return null;
  }
};

// res can be null here; if req is null, some errors may appear in the logs
export const checkApp = async function () {
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
    NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }
};

export const aiReady = (project) => {
  return project.modelApiKey && project.pineconeApiKey;
};
