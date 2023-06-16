import { prisma } from "lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  const { id } = req.query;

  // Get data submitted in request's body.
  const body = req.body;

  // Guard clause checks for first and last name,
  // and returns early if they are not found
  if (!body.name || !body.url) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name or URL not found" });
  }

  var project = await prisma.project.findFirst({
    where: {
      id,
      user: {
        email: user.email,
      },
    },
  });

  if (!project) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    var project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        url: body.url,
        apiKey: body.apiKey || project.apiKey,
      },
    });

    res.status(200).json({ result: { project } });
    console.log("Successfully updated project");
  } catch (err) {
    console.log("Could not update project", err);
    return res.status(500).json({ message: "Could not update project" });
  }
}
