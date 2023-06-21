import GraphConnection from "lib/graphConnection";
import { check, redirect, authorizeProject } from "lib/auth";
import {
  getConnections,
  getActivities,
  getThreads,
  toProperties,
} from "lib/queries";

// return members active in the time period, not those inactive but mentioned
// can deal with this corner case later
// if a conversation has an activity out of the window and the member has no other
// activities, they would be missing
const getMembers = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.runInNewSession(
    `MATCH (p:Project { id: $projectId })
       WITH p
     MATCH (p)-[:OWNS]->(m:Member)-[r:DID]-(a:Activity)
       WHERE a.timestamp >= $from
        AND a.timestamp <= $to
       RETURN m, count(a) as count
       ORDER BY count DESC`,
    { projectId, from, to }
  );
  return toProperties(records, (record) => ({
    activityCount: record.get("count").low,
    connections: [],
  }));
};

const getEntities = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.runInNewSession(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(e:Entity)-[:RELATES]-(a:Activity)-[:DID]-(m:Member)
      WHERE a.timestamp >= $from
        AND a.timestamp <= $to
      WITH e, COLLECT(DISTINCT m.globalActor) AS members, COLLECT(DISTINCT a.id) AS activities, count(a) AS count
      RETURN e, members, activities, count ORDER BY count DESC;
    `,
    { projectId, from, to }
  );
  var result = {};
  for (let record of records) {
    let id = record.get("e")?.properties?.id;
    if (id) {
      result[id] = {
        id,
        members: record.get("members"),
        activities: record.get("activities"),
        count: record.get("count").low,
      };
    }
  }
  return result;
};

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const graphConnection = new GraphConnection();
  var { id, from, to } = req.query;

  var project = await authorizeProject({ id, user, res });
  if (!project) {
    return;
  }
  const projectId = project.id;

  // default from and to to values that will not filter anything
  from = from || "1900-01-01";
  to = to || "2100-01-01";

  try {
    const props = { projectId, graphConnection, from, to };

    console.time("Fetching graph data");
    // these can all go async to be much faster, they don't depend on each other
    let [threads, entities, members, activities, connections] =
      await Promise.all([
        getThreads(props),
        getEntities(props),
        getMembers(props),
        getActivities(props),
        getConnections(props),
      ]);
    console.timeEnd("Fetching graph data");

    const result = {
      threads,
      entities,
      members,
      activities,
      connections,
    };
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
