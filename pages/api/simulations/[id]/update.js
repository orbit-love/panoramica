import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const { id } = req.query;

  // Get data submitted in request's body.
  const body = req.body;

  // Guard clause checks for first and last name,
  // and returns early if they are not found
  if (!body.name || !body.url) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name or URL not found" });
  }

  try {
    const prisma = new PrismaClient();
    var simulation = await prisma.simulation.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: body.name,
        url: body.url,
      },
    });

    res.status(200).json({ result: { simulation } });
    console.log("Successfully updated simulation");
  } catch (err) {
    console.log("Could not update simulation", err);
    return res.status(500).json({ message: "Could not update simulation" });
  }
}
