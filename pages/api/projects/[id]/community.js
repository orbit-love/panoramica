import { prisma } from "lib/db";
import GraphConnection from "lib/graphConnection";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

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
const getMembers = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `MATCH (m:Member)-[r:DID]-(a:Activity)
       WHERE a.projectId=$projectId
        AND a.timestamp > $from
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

const getConnections = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `
    MATCH (m:Member)
    CALL {
        WITH m AS main_member
        MATCH (main_member)-[:DID]->(a:Activity)-[:MENTIONS]->(mentioned:Member)
        WHERE a.projectId=$projectId
          AND a.timestamp > $from
          AND a.timestamp <= $to
        RETURN m AS actorOutgoing, mentioned AS actorIncoming, COLLECT(a.id) as activities, count(*) AS count
    }
    WITH actorOutgoing, actorIncoming, activities, count WHERE count > 0
    RETURN actorOutgoing as mentioner, actorIncoming as mentioned, activities, count ORDER by mentioner.globalActor, count DESC`,
    { projectId, from, to }
  );

  return records && mapifyConnections(records);
};

// get activities that have no parent
const getThreads = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `MATCH (a:Activity)<-[:REPLIES_TO]-(b:Activity)
       WHERE NOT EXISTS((a)-[:REPLIES_TO]->())
        AND a.projectId=$projectId
        AND a.timestamp > $from
        AND a.timestamp <= $to
        AND a.sourceParentId IS NULL
       WITH a, COLLECT(b.id) as children
       RETURN DISTINCT a, children ORDER BY a.timestamp DESC`,
    { projectId, from, to }
  );
  return toProperties(records);
};

const getActivities = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `MATCH (a:Activity)
       WHERE a.projectId=$projectId
        AND a.timestamp >= $from
        AND a.timestamp <= $to
      WITH a
       OPTIONAL MATCH (a)<-[:REPLIES_TO]-(b:Activity)
       OPTIONAL MATCH (a)-[:REPLIES_TO]->(c:Activity)
       RETURN a, c.id AS parent, COLLECT(b.id) AS children ORDER BY a.timestamp DESC`,
    { projectId, from, to }
  );
  return toProperties(records, (record) => ({
    children: record.get("children"),
    parent: record.get("parent"),
  }));
};

const getEntities = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
    `MATCH (e:Entity)-[:RELATES]-(a:Activity)-[:DID]-(m:Member)
      WHERE e.projectId=$projectId
        AND a.timestamp > $from
        AND a.timestamp <= $to
      WITH e, COLLECT(DISTINCT m.globalActor) AS members, COLLECT(DISTINCT a.id) AS activities, count(a) AS count
      RETURN e, members, activities, count ORDER BY count DESC;
    `,
    { projectId, from, to }
  );
  return toProperties(records, (record) => ({
    members: record.get("members"),
    activities: record.get("activities"),
    count: record.get("count").low,
  }));
};

const getConnectionCount = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (m:Member)-[r:DID]-(a:Activity)-[r2:MENTIONS]-(m2:Member)
      WHERE a.projectId=$projectId
      RETURN m.globalActor, m2.globalActor;
    `,
    { projectId }
  );
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
    `MATCH (a:Activity)<-[:REPLIES_TO]-(b:Activity)
      WHERE NOT EXISTS((a)-[:REPLIES_TO]->())
      AND a.projectId=$projectId
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
    `MATCH (a:Activity)-[:REPLIES_TO]->(b:Activity)
      WHERE a.projectId=$projectId
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
    `MATCH (a:Activity)
      WHERE NOT EXISTS((a)-[:REPLIES_TO]->())
      AND NOT EXISTS(()-[:REPLIES_TO]->(a))
      AND a.projectId=$projectId
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
    `MATCH (a:Activity)<-[:DID]-(m:Member)
      WHERE a.projectId=$projectId
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
  const graphConnection = new GraphConnection();
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  var { id, from, to } = req.query;

  var project = await prisma.project.findFirst({
    where: {
      id,
      user: {
        email: user.email,
      },
    },
  });

  if (!project) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const projectId = project.id;

  // default from and to to values that will not filter anything
  from = from || "1900-01-01";
  to = to || "2100-01-01";

  try {
    const props = { projectId, graphConnection, from, to };

    const result = {
      stats: await getStats(props),
      threads: await getThreads(props),
      entities: await getEntities(props),
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
