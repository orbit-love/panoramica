import { PrismaClient } from "@prisma/client";
import GraphConnection from "lib/graphConnection";

export default async function handler(req, res) {
  const graphConnection = new GraphConnection();

  const { id } = req.query;
  const simulationId = parseInt(id);

  try {
    const prisma = new PrismaClient();
    // delete existing activities for the simulation
    await prisma.activity.deleteMany({
      where: {
        simulationId,
      },
    });

    await prisma.simulation.delete({
      where: {
        id: simulationId,
      },
    });

    // clean up the graph
    await graphConnection.run(
      `MATCH (n) WHERE n.simulationId=$simulationId
        DETACH DELETE n`,
      { simulationId }
    );

    res.status(200).json({ result: "deleted" });
    console.log("Successfully deleted simulation");
  } catch (err) {
    console.log("Could not delete simulation", err);
    return res.status(500).json({ message: "Could not delete simulation" });
  } finally {
    await graphConnection.close();
  }
}
