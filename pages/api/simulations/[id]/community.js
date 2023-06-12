import GraphConnection from "lib/graphConnection";

const toProperties = (records, extra = () => {}) => {
  // filter out the weird empty single record when a query returns nothing
  return records
    .filter((record) => record.get(0)?.properties)
    .map((record) => ({
      ...record.get(0).properties,
      ...extra(record),
    }));
};

// return members active in the time period, not those inactive but mentioned
// can deal with this corner case later
const getMembers = async ({ simulationId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `MATCH (m:Member)-[r:DID]-(a:Activity)
       WHERE a.simulationId=$simulationId
        AND a.timestamp > $from
        AND a.timestamp <= $to
       RETURN m, count(a) as count
       ORDER BY count DESC`,
    { simulationId, from, to }
  );
  return toProperties(records, (record) => ({
    activityCount: record.get("count").low,
    connections: [],
  }));
};

const mapifyConnections = (records) => {
  let processedResult = {};

  for (let row of records) {
    let mentioner = row.get("mentioner").properties.globalActor;
    let mentioned = row.get("mentioned").properties.globalActor;
    let count = row.get("count").low;

    if (!(mentioner in processedResult)) {
      processedResult[mentioner] = {};
    }

    if (!(mentioned in processedResult[mentioner])) {
      processedResult[mentioner][mentioned] = [0, 0];
    }

    processedResult[mentioner][mentioned][0] = count;

    if (!(mentioned in processedResult)) {
      processedResult[mentioned] = {};
    }

    if (!(mentioner in processedResult[mentioned])) {
      processedResult[mentioned][mentioner] = [0, 0];
    }

    processedResult[mentioned][mentioner][1] = count;
  }

  return processedResult;
};

const getConnections = async ({ simulationId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `
    MATCH (m:Member)
    CALL {
        WITH m AS main_member
        MATCH (main_member)-[:DID]->(a:Activity)-[:MENTIONS]->(mentioned:Member)
        WHERE a.simulationId=$simulationId
          AND a.timestamp > $from
          AND a.timestamp <= $to
        RETURN m AS actorOutgoing, mentioned AS actorIncoming, COLLECT(a.id) as activities, count(*) AS count
    }
    WITH actorOutgoing, actorIncoming, activities, count WHERE count > 0
    RETURN actorOutgoing as mentioner, actorIncoming as mentioned, activities, count ORDER by mentioner.globalActor, count DESC`,
    { simulationId, from, to }
  );

  return records && mapifyConnections(records);
};

const getActivities = async ({ simulationId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `MATCH (a:Activity)
       WHERE a.simulationId=$simulationId
        AND a.timestamp > $from
        AND a.timestamp <= $to
       RETURN a ORDER BY a.timestamp DESC`,
    { simulationId, from, to }
  );
  return toProperties(records);
};

const getStats = async ({ simulationId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (a:Activity)-[:DID]-(m:Member)
      WHERE a.simulationId=$simulationId
     WITH MIN(a.timestamp) AS first,
     MAX(a.timestamp) AS last,
     COUNT(a) AS count,
     COUNT(DISTINCT m) AS memberCount
     RETURN first, last, count, memberCount;`,
    { simulationId }
  );
  const record = records[0];
  return {
    activities: {
      first: record.get("first"),
      last: record.get("last"),
      count: record.get("count").low,
    },
    members: {
      count: record.get("memberCount").low,
    },
  };
};

export default async function handler(req, res) {
  const graphConnection = new GraphConnection();

  var { id, from, to } = req.query;
  const simulationId = parseInt(id);

  // default from and to to values that will not filter anything
  from = from || "1900-01-01";
  to = to || "2100-01-01";

  try {
    const props = { simulationId, graphConnection, from, to };

    const result = {
      stats: await getStats(props),
      members: await getMembers(props),
      activities: await getActivities(props),
      connections: await getConnections(props),
    };
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
