import { prisma } from "src/data/db";
import GraphConnection from "src/data/graph/Connection";
import { check, redirect, authorizeProject } from "src/auth/auth";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }
  const graphConnection = new GraphConnection();

  const { id } = req.query;

  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
    }

    let projectId = project.id;

    // delete data from the graph
    await graphConnection.run(
      `MATCH (p:Project { id: $projectId })-[*..4]->(n)
        DETACH DELETE n`,
      { projectId }
    );

    // delete existing activities for the project
    await prisma.activity.deleteMany({
      where: {
        projectId,
      },
    });

    // delete the project itself
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    res.status(200).json({ result: "deleted" });
    console.log("Successfully deleted project");
  } catch (err) {
    console.log("Could not delete project", err);
    return res.status(500).json({ message: "Could not delete project" });
  } finally {
    await graphConnection.close();
  }
}
