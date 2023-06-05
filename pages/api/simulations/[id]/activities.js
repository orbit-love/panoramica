import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const { id } = req.query;
  const prisma = new PrismaClient();
  try {
    var activities = await prisma.activity.findMany({
      where: {
        simulationId: parseInt(id),
      },
      orderBy: {
        timestamp: "asc",
      },
    });
    activities = JSON.parse(JSON.stringify(activities));

    res.status(200).json({ result: { activities } });
  } catch (err) {
    res.status(500).json({ error: "failed to load data" });
    throw err;
  }
}
