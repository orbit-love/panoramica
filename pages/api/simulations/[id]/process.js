import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const { id } = req.query;
  const prisma = new PrismaClient();

  const simulationId = parseInt(id);
  try {
    const simulation = await prisma.simulation.findUnique({
      where: {
        id: simulationId,
      },
    });

    const activities = await prisma.activity.findMany({
      where: {
        simulationId: simulation.id,
      },
    });

    res.status(200).json({ result: { count: activities.length } });
    console.log("Successfully processed");
  } catch (err) {
    console.log("Could not process activities", err);
    return res.status(500).json({ message: "Could not process activities" });
  }
}
