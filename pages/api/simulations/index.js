import { prisma } from "lib/db";

export default async function handler(_, res) {
  var simulations = await prisma.simulation.findMany({});
  res.status(200).json({ result: { simulations } });
}
