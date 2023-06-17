import { check, redirect } from "lib/auth";
import { prisma } from "lib/db";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  var projects = await prisma.project.findMany({
    where: {
      user: {
        email: user.email,
      },
    },
  });
  // don't return any api keys
  for (let project of projects) {
    delete project.apiKey;
  }
  res.status(200).json({ result: { projects } });
}
