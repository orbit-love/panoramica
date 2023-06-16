import { prisma } from "lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  var projects = await prisma.project.findMany({
    where: {
      user: {
        email: user.email,
      },
    },
  });
  // don't return any api keys
  for (let project of projects) {
    project.apiKey = null;
  }
  res.status(200).json({ result: { projects } });
}
