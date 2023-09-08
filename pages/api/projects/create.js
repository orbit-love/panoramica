import { prisma } from "src/data/db";
import { check, redirect } from "src/auth";
import { graph } from "src/data/db";
import { setupProject } from "src/data/graph/mutations";

export default async function handler(req, res) {
  if (process.env.DEMO_SITE) {
    return res.status(401).json({ data: "Project creation is disallowed" });
  }

  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  // Get data submitted in request's body.
  const body = req.body;

  // Guard clause checks for name and returns early
  if (!body.name) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name not found" });
  }

  const session = graph.session();

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

    await session.writeTransaction(async (tx) => {
      await setupProject({ tx, project, user });
    });

    res.status(200).json({ result: { project } });
    console.log("Successfully created project");
  } catch (err) {
    console.log("Could not create project", err);
    return res.status(500).json({ message: "Could not create project" });
  }
}
