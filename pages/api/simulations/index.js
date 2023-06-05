import { PrismaClient } from "@prisma/client";

export default async function handler(_, res) {
  const prisma = new PrismaClient();
  var simulations = await prisma.simulation.findMany({});
  res.status(200).json({ result: { simulations } });
}
