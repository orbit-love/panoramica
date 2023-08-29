import { prisma } from "src/data/db";
import { check, redirect, authorizeProject } from "src/auth";
import { graph } from "src/data/db";
import { mergeProject } from "src/data/graph/mutations";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;

  // Get data submitted in request's body.
  const body = req.body;

  // Guard clause checks for first and last name,
  // and returns early if they are not found
  if (!body.name) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name not provided" });
  }

  var project = await authorizeProject({ id, user, res });
  if (!project) {
    return;
  }

  try {
    var project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        demo: body.demo,
        workspace: body.workspace,
        url: body.url,
        apiKey: body.apiKey || project.apiKey,
        modelName: body.modelName,
        modelApiKey: body.modelApiKey || project.modelApiKey,
        typesenseApiKey: body.typesenseApiKey || project.typesenseApiKey,
        typesenseUrl: body.typesenseUrl || project.typesenseUrl,
      },
    });

    // sync any changes to the graph
    const session = graph.session();
    await session.writeTransaction(async (tx) => {
      await mergeProject({ tx, project, user });
    });

    res.status(200).json({ result: { project } });
    console.log("Successfully updated project");
  } catch (err) {
    console.log("Could not update project", err);
    return res.status(500).json({ message: "Could not update project" });
  }
}
