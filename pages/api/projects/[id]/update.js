import { prisma } from "source/data/db";
import { check, redirect, authorizeProject } from "lib/auth";

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
  if (!body.name || !body.workspace) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name or workspace not provided" });
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
        workspace: body.workspace,
        url: body.url,
        apiKey: body.apiKey || project.apiKey,
        modelName: body.modelName,
        modelApiKey: body.modelApiKey || project.modelApiKey,
        pineconeApiKey: body.pineconeApiKey || project.pineconeApiKey,
        pineconeApiEnv: body.pineconeApiEnv,
        pineconeIndexName: body.pineconeIndexName,
      },
    });

    res.status(200).json({ result: { project } });
    console.log("Successfully updated project");
  } catch (err) {
    console.log("Could not update project", err);
    return res.status(500).json({ message: "Could not update project" });
  }
}
