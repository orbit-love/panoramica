import GraphConnection from "lib/graphConnection";

const toProperties = (records, extra = () => {}) => {
  return records.map((record) => ({
    ...record.get(0).properties,
    ...extra(record),
  }));
};

// return members active in the time period, not those inactive but mentioned
// can deal with this corner case later
const getMembers = async ({ simulationId, graphConnection, low, high }) => {
  const result = await graphConnection.run(
    `MATCH (m:Member)-[r:DID]-(a:Activity)
       WHERE a.simulationId=$simulationId
        AND a.timestamp > $low
        AND a.timestamp <= $high
       RETURN m, count(a) as count
       ORDER BY count DESC`,
    { simulationId, low, high }
  );
  return toProperties(result.records, (record) => ({
    activityCount: record.get("count").low,
    connections: [],
  }));
};

const mapifyConnections = (records) => {
  let processedResult = {};

  for (let record of records) {
    let mentioner = record.get("mentioner").properties;
    mentioner = mentioner.globalActor || mentioner.actor;

    let mentioned = record.get("mentioned").properties;
    mentioned = mentioned.globalActor || mentioned.actor;

    let count = record.get("count").low;

    if (!(mentioner in processedResult)) {
      processedResult[mentioner] = {};
    }
    if (!(mentioned in processedResult)) {
      processedResult[mentioned] = {};
    }

    processedResult[mentioner][mentioned] = [count, 0];
    processedResult[mentioned][mentioner] = [0, count];
  }

  for (let [member, connections] of Object.entries(processedResult)) {
    for (let [connectedMember, counts] of Object.entries(connections)) {
      if (connectedMember in processedResult[member]) {
        processedResult[member][connectedMember] = [
          Math.max(counts[0], processedResult[member][connectedMember][0]),
          Math.max(counts[1], processedResult[member][connectedMember][1]),
        ];
      }
    }
  }

  return processedResult;
};

const getConnections = async ({ simulationId, graphConnection, low, high }) => {
  const result = await graphConnection.run(
    `
    MATCH (m:Member)
    CALL {
        WITH m AS main_member
        MATCH (main_member)-[:DID]->(a:Activity)-[:MENTIONS]->(mentioned:Member)
        WHERE a.simulationId=$simulationId
          AND a.timestamp > $low
          AND a.timestamp <= $high
        RETURN m AS actorOutgoing, mentioned AS actorIncoming, COLLECT(a.id) as activities, count(*) AS count
    UNION
        WITH m AS main_member
        MATCH (mentioner:Member)-[:DID]->(a:Activity)-[:MENTIONS]->(main_member)
        WHERE a.simulationId=$simulationId
          AND a.timestamp > $low
          AND a.timestamp <= $high
        RETURN m AS actorIncoming, mentioner AS actorOutgoing, COLLECT(a.id) AS activities, count(*) AS count
    }
    WITH actorOutgoing, actorIncoming, activities, count WHERE count > 0
    RETURN actorOutgoing as mentioner, actorIncoming as mentioned, activities, count ORDER by mentioner.globalActor, count DESC`,
    { simulationId, low, high }
  );
  const mapped = mapifyConnections(result.records);
  return mapped;
};

const getActivities = async ({ simulationId, graphConnection, low, high }) => {
  const result = await graphConnection.run(
    `MATCH (a:Activity)
       WHERE a.simulationId=$simulationId
        AND a.timestamp > $low
        AND a.timestamp <= $high
       RETURN a ORDER BY a.timestamp DESC`,
    { simulationId, low, high }
  );
  return toProperties(result.records);
};

export default async function handler(req, res) {
  const graphConnection = new GraphConnection();

  var { id, low, high } = req.query;
  const simulationId = parseInt(id);

  // low = low || "1900-01-01";
  // high = high || "2100-01-01";

  low = "1900-01-01";
  high = "2100-01-01";

  try {
    const props = { simulationId, graphConnection, low, high };

    const result = {
      members: await getMembers(props),
      activities: await getActivities(props),
      connections: await getConnections(props),
    };
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
