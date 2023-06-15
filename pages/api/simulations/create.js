import { prisma } from "lib/db";

export default async function handler(req, res) {
  // Get data submitted in request's body.
  const body = req.body;

  // Guard clause checks for first and last name,
  // and returns early if they are not found
  if (!body.name || !body.url) {
    // Sends a HTTP bad request error code
    return res.status(400).json({ data: "Name or URL not found" });
  }

  try {
    var simulation = await prisma.simulation.create({
      data: {
        name: body.name,
        url: body.url,
      },
    });

    res.status(200).json({ result: { simulation } });
    console.log("Successfully created simulation");
  } catch (err) {
    console.log("Could not create simulation", err);
    return res.status(500).json({ message: "Could not create simulation" });
  }
}
