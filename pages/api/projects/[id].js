import GraphConnection from "lib/graphConnection";
import { check, redirect, authorizeProject } from "lib/auth";
import c from "lib/common";

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

const mapifyConnections = (records) => {
  let processedResult = {};

  for (let row of records) {
    let mentioner = row.get("outgoing").properties.globalActor;
    let mentioned = row.get("incoming").properties.globalActor;
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

// get connections derived from mentions and from replies
const getConnections = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.runInNewSession(
    `MATCH (p:Project { id: $projectId })
       WITH p
    MATCH (p)-[:OWNS]->(m:Member)
    CALL {
      WITH m AS outgoing
      MATCH (outgoing)-[:DID]->(a:Activity)-[:MENTIONS]->(incoming:Member)
            WHERE a.timestamp >= $from
              AND a.timestamp <= $to
      WITH outgoing, incoming, COLLECT(a.id) as activities, count(*) AS count
      WITH outgoing, incoming, activities, count WHERE count > 0
      RETURN outgoing, incoming, activities, count
    UNION
      WITH m AS outgoing
      MATCH (outgoing)-[:DID]->(a:Activity)-[:REPLIES_TO]->(:Activity)<-[:DID]-(incoming:Member)
            WHERE a.timestamp >= $from
              AND a.timestamp <= $to
      WITH outgoing, incoming, COLLECT(a.id) as activities, count(*) AS count
      WITH outgoing, incoming, activities, count WHERE count > 0
      RETURN outgoing, incoming, activities, count
    }
    WITH outgoing, incoming, activities, count
      WHERE outgoing <> incoming
    RETURN outgoing, incoming, activities, count ORDER by outgoing.globalActor, count DESC;`,
    { projectId, from, to }
  );

  return records && mapifyConnections(records);
};

const getActivities = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.runInNewSession(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
       WHERE a.timestamp >= $from
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
    let id = record.get("e").properties.id;
    result[id] = {
      id,
      members: record.get("members"),
      activities: record.get("activities"),
      count: record.get("count").low,
    };
  }
  return result;
};

// return activities that represent thread parents, along with the members
// and entities that exist throughout the thread
// if the conversation started in the timeframe, we grab it, otherwise not
// this will definitely not be the right solution forever
// a workaround may be to leave out to/from for now, the UI will handle it
const getThreads = async function ({ projectId, graphConnection, from, to }) {
  var result = {};

  const updateResult = function (activity, members, entities) {
    let item = result[activity];
    if (item) {
      item.members = [...item.members, ...members].filter(c.onlyUnique);
      item.entities = [...item.entities, ...entities].filter(c.onlyUnique);
    } else {
      result[activity] = { members: [...members], entities: [...entities] };
    }
  };

  // actually we could filter replies out here...
  // come back to it
  // WHERE NOT EXISTS((a)-[:REPLIES_TO]->())
  //   AND a.sourceParentId IS NULL
  const matchThread = `
    MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)<-[:REPLIES_TO*0..]-(child:Activity)
      WITH DISTINCT a
      MATCH path = (a)<-[:REPLIES_TO*0..]-(reply)
      WITH a, path
      UNWIND nodes(path) as node
  `;

  const addRepliers = async () => {
    const { records } = await graphConnection.runInNewSession(
      `${matchThread}
      MATCH (node)<-[:DID]-(m:Member)
      RETURN a.id as activity, COLLECT(DISTINCT m.globalActor) as members`,
      { projectId, from, to }
    );

    for (let record of records) {
      updateResult(record.get("activity"), record.get("members"), []);
    }
  };

  const addMentioners = async () => {
    const { records } = await graphConnection.runInNewSession(
      `${matchThread}
      MATCH (node)-[:MENTIONS]-(m:Member)
      RETURN a.id as activity, COLLECT(DISTINCT m.globalActor) as members`,
      { projectId, from, to }
    );

    for (let record of records) {
      updateResult(record.get("activity"), record.get("members"), []);
    }
  };

  const addEntities = async () => {
    const { records } = await graphConnection.runInNewSession(
      `${matchThread}
      MATCH (node)-[:RELATES]-(e:Entity)
      RETURN a.id as activity, COLLECT(DISTINCT e.id) as entities`,
      { projectId, from, to }
    );

    for (let record of records) {
      updateResult(record.get("activity"), [], record.get("entities"));
    }
  };

  await addRepliers();
  await addMentioners();
  await addEntities();

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
