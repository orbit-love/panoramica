import { PrismaClient } from "@prisma/client";
import neo4j from "neo4j-driver";

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

    const uri = process.env.MEMGRAPH_URI;
    const username = process.env.MEMGRAPH_USERNAME;
    const password = process.env.MEMGRAPH_PASSWORD;

    const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    const message = "Hello Memgraph from Node.js!";

    try {
      const result = await session.run(
        `CREATE (n:FirstNode {message: $message}) RETURN n`,
        { message }
      );

      const singleRecord = result.records[0];
      const node = singleRecord.get(0);

      console.log("Created node:", node.properties.message);
    } finally {
      await session.close();
    }

    await driver.close();

    res.status(200).json({ result: { count: activities.length } });
    console.log("Successfully processed");
  } catch (err) {
    console.log("Could not process activities", err);
    return res.status(500).json({ message: "Could not process activities" });
  }
}
