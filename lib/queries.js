import c from "lib/common";

// return activities that represent thread parents, along with the members
// and entities that exist throughout the thread
// if the conversation started in the timeframe, we grab it, otherwise not
// this will definitely not be the right solution forever
// a workaround may be to leave out to/from for now, the UI will handle it
export const getThreads = async function ({
  projectId,
  graphConnection,
  from,
  to,
}) {
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

  // match each activity and produce a path of its replies, including itself
  // (*1.. would exclude itself)
  const matchThread = `
    MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
      WITH DISTINCT a
      MATCH path = (a)<-[:REPLIES_TO*0..]-()
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

  const addParents = async () => {
    const { records } = await graphConnection.runInNewSession(
      `MATCH (p:Project { id: $projectId })
        WITH p
        MATCH (p)-[:OWNS]->(a:Activity)-[:REPLIES_TO]->(parent:Activity)
      RETURN a.id as activity, parent.id as parent`,
      { projectId, from, to }
    );

    for (let record of records) {
      var item = result[record.get("activity")];
      item.parent = record.get("parent");
      // if something has a parent, it's a reply
      item.type = "reply";
    }
  };

  const addChildren = async () => {
    const { records } = await graphConnection.runInNewSession(
      `MATCH (p:Project { id: $projectId })
        WITH p
        MATCH (p)-[:OWNS]->(a:Activity)<-[:REPLIES_TO]-(child:Activity)
        WITH a, child
        ORDER by child.timestamp
      RETURN a.id as activity, COLLECT(DISTINCT child.id) AS children`,
      { projectId, from, to }
    );

    for (let record of records) {
      var item = result[record.get("activity")];
      item.children = record.get("children");
      // if something has no parent but does have children, it's a thread (starter)
      // this call comes after the parents call for this reason
      if (!item.parent) {
        item.type = "thread";
      }
    }
  };

  // return the list of all descendant activities and the first/last timestamps
  // for help with rendering the conversation
  const addTimestamp = async () => {
    const { records } = await graphConnection.runInNewSession(
      `MATCH (p:Project { id: $projectId })
        WITH p
        MATCH (p)-[:OWNS]->(a:Activity)<-[:REPLIES_TO*1..]-(descendant:Activity)
        WITH a, descendant
        ORDER by descendant.timestamp
      WITH a.id AS activity,
           COLLECT(DISTINCT descendant.id) as descendants,
           COLLECT(descendant.timestamp) as timestamps
      RETURN activity, descendants,
        LAST(timestamps) AS last_timestamp,
        HEAD(timestamps) AS first_timestamp`,
      { projectId, from, to }
    );

    for (let record of records) {
      var item = result[record.get("activity")];
      item.first_timestamp = record.get("first_timestamp");
      item.last_timestamp = record.get("last_timestamp");
      item.descendants = record.get("descendants");
    }
  };

  // these have to be done serially for now
  await addRepliers();
  await addMentioners();
  await addEntities();
  await addParents();
  await addChildren();
  await addTimestamp();

  // if an activity has no parent or children, it's an island
  for (let [_, item] of Object.entries(result)) {
    if (!item.type) {
      item.type = "island";
    }
  }

  return result;
};

// get all the activities within the timeframe
export const getActivities = async ({
  projectId,
  graphConnection,
  from,
  to,
}) => {
  const { records } = await graphConnection.runInNewSession(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
       WHERE a.timestamp >= $from
        AND a.timestamp <= $to
    RETURN a ORDER BY a.timestamp DESC`,
    { projectId, from, to }
  );
  return toProperties(records);
};

// get connections derived from mentions and from replies
export const getConnections = async ({
  projectId,
  graphConnection,
  from,
  to,
}) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
       WITH p
    MATCH (p)-[:OWNS]->(m:Member)-[:DID]->(a:Activity)
      WHERE a.timestamp >= $from
        AND a.timestamp <= $to
    CALL {
      WITH m AS outgoing, a
      MATCH (outgoing)-[:DID]->(a)-[:MENTIONS]->(incoming:Member)
      WITH outgoing, incoming, COLLECT(a.id) as activities, count(*) AS count
      WITH outgoing, incoming, activities, count WHERE count > 0
      RETURN outgoing, incoming, activities, count
    UNION
      WITH m AS outgoing, a
      MATCH (outgoing)-[:DID]->(a)-[:REPLIES_TO]->(:Activity)<-[:DID]-(incoming:Member)
      WITH outgoing, incoming, COLLECT(a.id) as activities, count(*) AS count
      WITH outgoing, incoming, activities, count WHERE count > 0
      RETURN outgoing, incoming, activities, count
    }
    WITH outgoing, incoming, activities, count
      WHERE outgoing <> incoming
    RETURN outgoing, incoming, activities, count ORDER by outgoing.globalActor, count DESC`,
    { projectId, from, to }
  );

  return records && mapifyConnections(records);
};

const mapifyConnections = (records) => {
  let result = {};

  for (let row of records) {
    let mentioner = row.get("outgoing").properties.globalActor;
    let mentioned = row.get("incoming").properties.globalActor;
    let count = row.get("count").low;

    if (!(mentioner in result)) {
      result[mentioner] = {};
    }

    if (!(mentioned in result[mentioner])) {
      result[mentioner][mentioned] = [0, 0];
    }

    result[mentioner][mentioned][0] += count;

    if (!(mentioned in result)) {
      result[mentioned] = {};
    }

    if (!(mentioner in result[mentioned])) {
      result[mentioned][mentioner] = [0, 0];
    }

    result[mentioned][mentioner][1] += count;
  }

  return result;
};

export const toProperties = (records, extra = () => {}) => {
  // filter out the weird empty single record when a query returns nothing
  return records
    .filter((record) => record.get(0)?.properties)
    .map((record) => ({
      ...record.get(0).properties,
      ...extra(record),
    }));
};
