import c from "src/configuration/common";

export const getEverything = async (props) => {
  return Promise.all([
    getConversations(props),
    getMembers(props),
    getActivities(props),
    getConnections(props),
  ]);
};

// return members with an activity in the time period
export const getMembers = async ({ projectId, graphConnection, from, to }) => {
  const { records } = await graphConnection.run(
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
  }));
};

// returns a map of activities that includes members and replies
export const getConversations = async function ({
  projectId,
  graphConnection,
  from,
  to,
}) {
  var result = {};

  const updateResult = function (activity, members) {
    let item = result[activity];
    if (item) {
      item.members = [...item.members, ...members].filter(c.onlyUnique);
    } else {
      result[activity] = { members: [...members] };
    }
  };

  // match each activity and produce a path of its replies, including itself
  const matchConversation = `
    MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
      WITH DISTINCT a
      MATCH path = (a)<-[:REPLIES_TO*0..]-()
      WITH a, path
      UNWIND nodes(path) as node
  `;

  const addRepliers = async () => {
    const { records } = await graphConnection.run(
      `${matchConversation}
      MATCH (node)<-[:DID]-(m:Member)
      RETURN a.id as activity, COLLECT(DISTINCT m.globalActor) as members`,
      { projectId, from, to }
    );

    for (let record of records) {
      updateResult(record.get("activity"), record.get("members"), []);
    }
  };

  const addMentioners = async () => {
    const { records } = await graphConnection.run(
      `${matchConversation}
      MATCH (node)-[:MENTIONS]-(m:Member)
      RETURN a.id as activity, COLLECT(DISTINCT m.globalActor) as members`,
      { projectId, from, to }
    );

    for (let record of records) {
      updateResult(record.get("activity"), record.get("members"), []);
    }
  };

  const addChildren = async () => {
    const { records } = await graphConnection.run(
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
    }
  };

  // these have to be done serially for now
  await addRepliers();
  await addMentioners();
  await addChildren();

  return result;
};

// get all the activities within the timeframe
export const getActivities = async ({
  projectId,
  graphConnection,
  from,
  to,
}) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
       ${
         from && to ? ` WHERE a.timestamp >= $from AND a.timestamp <= $to ` : ``
       }
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
      WITH outgoing, incoming, max(a.timestampInt) as lastInteraction, COLLECT(a.id) as activities, count(*) AS count
      WITH outgoing, incoming, lastInteraction, activities, count WHERE count > 0
      RETURN outgoing, incoming, lastInteraction, activities, count
    UNION
      WITH m AS outgoing, a
      MATCH (outgoing)-[:DID]->(a)-[:REPLIES_TO]->(:Activity)<-[:DID]-(incoming:Member)
      WITH outgoing, incoming, max(a.timestampInt) as lastInteraction, COLLECT(a.id) as activities, count(*) AS count
      WITH outgoing, incoming, lastInteraction, activities, count WHERE count > 0
      RETURN outgoing, incoming, lastInteraction, activities, count
    }
    WITH outgoing, incoming, lastInteraction, activities, count
      WHERE outgoing <> incoming
    RETURN outgoing, incoming, lastInteraction, activities, count ORDER by outgoing.globalActor, count DESC`,
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
      result[mentioner][mentioned] = [0, 0, row.get("lastInteraction")];
    }

    result[mentioner][mentioned][0] += count;

    if (!(mentioned in result)) {
      result[mentioned] = {};
    }

    if (!(mentioner in result[mentioned])) {
      result[mentioned][mentioner] = [0, 0, row.get("lastInteraction")];
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
