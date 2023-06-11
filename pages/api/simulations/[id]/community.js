import neo4j from "neo4j-driver";

export default async function handler(req, res) {
  const { id, low, high } = req.query;
  const simulationId = parseInt(id);

  const uri = process.env.MEMGRAPH_URI;
  const username = process.env.MEMGRAPH_USERNAME;
  const password = process.env.MEMGRAPH_PASSWORD;

  console.log("params", { id, low, high });

  var driver, session;

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    session = driver.session();

    const result = await session.run(
      `MATCH (a:Activity)
       WHERE a.simulationId=$simulationId
       RETURN a ORDER BY a.timestamp`,
      { simulationId }
    );
    const records = result.records;
    const activities = records.map((record) => record.get(0).properties);

    const members = [];
    const connections = [];

    res.status(200).json({ result: { activities, members, connections } });
  } catch (err) {
    res.status(500).json({ error: "failed to load data" });
    console.log(err);
  } finally {
    await session.close();
    await driver.close();
  }
}
