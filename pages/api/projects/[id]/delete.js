import { prisma } from "lib/db";
import GraphConnection from "lib/graphConnection";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  const graphConnection = new GraphConnection();

  const { id } = req.query;
  const projectId = parseInt(id);

  // do authorization
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        user: {
          email: user.email,
        },
      },
    });

    if (!project) {
      console.log("Could not delete project", err);
      return res.status(404).json({ message: "Project not found" });
    }

    // delete existing activities for the project
    await prisma.activity.deleteMany({
      where: {
        projectId,
      },
    });

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    // clean up the graph
    await graphConnection.run(
      `MATCH (n) WHERE n.projectId=$projectId
        DETACH DELETE n`,
      { projectId }
    );

    res.status(200).json({ result: "deleted" });
    console.log("Successfully deleted project");
  } catch (err) {
    console.log("Could not delete project", err);
    return res.status(500).json({ message: "Could not delete project" });
  } finally {
    await graphConnection.close();
  }
}
