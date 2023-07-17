import { check, redirect } from "src/auth/auth";
import { prisma } from "src/data/db";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  let where = {};
  if (!user.admin) {
    where.user = {
      email: user.email,
    };
  }

  var projects = await prisma.project.findMany({
    where,
  });
  // don't return any api keys
  for (let project of projects) {
    delete project.apiKey;
  }
  res.status(200).json({ result: { projects } });
}
