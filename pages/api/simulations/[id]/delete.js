import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const prisma = new PrismaClient();
    await prisma.simulation.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(200).json({ result: "deleted" });
    console.log("Successfully deleted simulation");
  } catch (err) {
    console.log("Could not delete simulation", err);
    return res.status(500).json({ message: "Could not delete simulation" });
  }
}
