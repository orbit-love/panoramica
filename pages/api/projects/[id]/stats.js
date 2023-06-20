import GraphConnection from "lib/graphConnection";
import { check, redirect, authorizeProject } from "lib/auth";

// count the number of mention connections or reply connections
const getConnectionCount = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId }) WITH p
      MATCH (p)-[:OWNS]->(m1:Member)-[:DID]->(a1:Activity)-[r1:REPLIES_TO]->(a2:Activity)<-[:DID]-(m2:Member)
      WHERE m1 <> m2
      RETURN m1.globalActor, m2.globalActor
    UNION
      MATCH (p:Project { id: $projectId }) WITH p
      MATCH (p)-[:OWNS]->(m1:Member)-[:DID]->(a:Activity)-[r2:MENTIONS]->(m2:Member)
      WHERE m1 <> m2
      RETURN m1.globalActor, m2.globalActor`,
    { projectId }
  );
  // mentions can be in two directions, so we use a set to ensure only 1 per pair of members
  const set = new Set();
  for (let record of records) {
    set.add([record.get(0), record.get(1)].sort().join("---"));
  }
  return set.size;
};

// count the number of activities that have replies but no parent -
// i.e. the thread starters
// filter out activities that have a parent on the source platform but not
// in telescope - these will be treated at (partial) islands
const getThreadCount = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)<-[:REPLIES_TO]-(:Activity)
      WHERE NOT EXISTS((a)-[:REPLIES_TO]->())
      AND a.sourceParentId IS NULL
     WITH count(DISTINCT a) as count
     RETURN count
    `,
    { projectId }
  );
  const record = records[0];
  return record.get("count").low;
};

// count the number of activities that have a parent, includes leafs and branches
const getReplyCount = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)-[:REPLIES_TO]->(b:Activity)
     WITH count(DISTINCT a) as count
     RETURN count
    `,
    { projectId }
  );
  const record = records[0];
  return record.get("count").low;
};

const getIslandCount = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
      WHERE NOT EXISTS((a)-[:REPLIES_TO]->())
      AND NOT EXISTS(()-[:REPLIES_TO]->(a))
     WITH count(DISTINCT a) as count
     RETURN count
    `,
    { projectId }
  );
  const record = records[0];
  return record.get("count").low;
};

const getStats = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)<-[:DID]-(m:Member)
     WITH MIN(a.timestamp) AS first,
     MAX(a.timestamp) AS last,
     COUNT(a) AS count,
     COUNT(DISTINCT m) AS memberCount
     RETURN first, last, count, memberCount;`,
    { projectId }
  );
  const record = records[0];
  const props = {
    projectId,
    graphConnection,
  };
  return {
    activities: {
      first: record.get("first"),
      last: record.get("last"),
      count: record.get("count").low,
    },
    threads: {
      threadCount: await getThreadCount(props),
      replyCount: await getReplyCount(props),
      islandCount: await getIslandCount(props),
    },
    members: {
      count: record.get("memberCount").low,
      connections: {
        count: await getConnectionCount(props),
      },
    },
  };
};

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const graphConnection = new GraphConnection();
  var { id } = req.query;

  var project = await authorizeProject({ id, user, res });
  if (!project) {
    return;
  }
  const projectId = project.id;

  try {
    const props = { projectId, graphConnection };
    const result = {
      stats: await getStats(props),
    };
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
