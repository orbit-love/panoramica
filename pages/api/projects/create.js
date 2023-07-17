import { prisma } from "src/data/db";
import { check, redirect } from "src/auth";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  // Get data submitted in request's body.
  const body = req.body;

  // Guard clause checks for first and last name,
  // and returns early if they are not found
  if (!body.name || !body.workspace || !body.apiKey) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name or URL not found" });
  }

  try {
    var project = await prisma.project.create({
      data: {
        name: body.name,
        workspace: body.workspace,
        apiKey: body.apiKey,
        user: {
          connect: { email: user.email },
        },
      },
    });

    res.status(200).json({ result: { project } });
    console.log("Successfully created project");
  } catch (err) {
    console.log("Could not create project", err);
    return res.status(500).json({ message: "Could not create project" });
  }
}
