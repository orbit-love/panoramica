import utils from "src/utils";

export async function mergeProject({ project, user, tx }) {
  const { id: projectId, name, demo } = project;
  const { id: userId, email } = user;

  // merge a node for the user
  await tx.run(
    `MERGE (u:User { id: $userId })
       SET u.email = $email`,
    { userId, email }
  );
  console.log("Memgraph: Merged (User)");

  // merge a node for the project
  await tx.run(
    `MERGE (p:Project { id: $projectId })
      SET p.demo = $demo, p.name = $name`,
    { projectId, demo, name }
  );
  console.log("Memgraph: Merged (Project)");

  // connect the user and the project if the project has no
  // existing user connection - otherwise don't - this avoids
  // creating an edge when an admin user needs to repair a project
  const { records } = await tx.run(
    `MATCH (p:Project { id: $projectId })<-[:CREATED]-(u:User)
     RETURN u`,
    { projectId, userId }
  );
  if (records.length === 0) {
    // merge project and user nodes
    await tx.run(
      `MATCH (p:Project { id: $projectId })
       MATCH (u:User { id: $userId })
       WITH p, u
         MERGE (p)<-[:CREATED]-(u)`,
      { projectId, userId }
    );
    console.log("Memgraph: Merged (Project)<-[:CREATED]-(User)");
  }
}

export async function setupProject({ project, user, tx }) {
  await mergeProject({ project, user, tx });
  console.log("Memgraph: Created project");
}

export async function clearProject({ project, tx }) {
  const projectId = project.id;
  // delete existing nodes and relationships
  await tx.run(
    `MATCH (p:Project { id: $projectId })
       WITH p
       MATCH (p)-[]->(n)
         WHERE n:Activity OR n:Member or n:Conversation
         WITH n
          OPTIONAL MATCH (n)-[]-(i:Identity)
          DETACH DELETE n, i`,
    { projectId }
  );
  console.log("Memgraph: Cleared project");
}

// set up constraints and indexes for memgraph
export async function setupConstraints({ tx }) {
  // ensure only one project with the same id is ever created
  await tx.run(`CREATE CONSTRAINT ON (p:Project) ASSERT p.id IS UNIQUE`);
  // ensure only one user id is ever created
  await tx.run(`CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE`);
  // create indices for faster lookups
  await tx.run(`CREATE INDEX ON :Project(id)`);
  await tx.run(`CREATE INDEX ON :Member(globalActor)`);
  await tx.run(`CREATE INDEX ON :Activity(id)`);
  await tx.run(`CREATE INDEX ON :Activity(timestamp)`);

  console.log("Memgraph: Created constraints");
}

const mergeActivity = `
  CALL uuid_generator.get() YIELD uuid
  MERGE (a:Activity { key: p.id + "-" + item.sourceId })
    ON CREATE SET
      a.id = uuid
    SET a += {
      actor: item.actor,
      actorName: item.actorName,
      globalActor: item.globalActor,
      globalActorName: item.globalActorName,
      globalActorAvatar: item.globalActorAvatar,
      sourceId: item.sourceId,
      sourceParentId: item.sourceParentId,
      source: item.source,
      sourceType: item.sourceType,
      sourceChannel: item.sourceChannel,
      projectId: p.id,
      text: item.text,
      timestamp: item.timestamp,
      timestampInt: item.timestampInt,
      textHtml: item.textHtml,
      url: item.url,
      tags: item.tags,
      mentions: item.mentions
    }
  MERGE (p)-[:OWNS]->(a)
`;

export async function syncActivities({ tx, project, activities }) {
  const projectId = project.id;

  for (let activity of activities) {
    if (!activity.timestampInt) {
      activity.timestampInt = Date.parse(activity.timestamp);
    }
  }

  // bulk add all the activities with the help of UNWIND
  // use the sourceId as a key to avoid duplicates
  // don't change the id of the activity, only set when new
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
          UNWIND batch AS item
          ${mergeActivity}`,
    { activities, projectId }
  );
  console.log("Memgraph: Added (:Activity) nodes", activities.length);
}

export async function loadActivitiesFromUrl({ tx, project, url }) {
  const projectId = project.id;

  // bulk add all the activities with the help of UNWIND
  // use the sourceId as a key to avoid duplicates
  // don't change the id of the activity, only set when new
  const { records } = await tx.run(
    `CALL json_util.load_from_url($url)
     YIELD objects
      MATCH (p:Project { id: $projectId })
        WITH p, objects AS batch
          UNWIND batch AS item
          ${mergeActivity}
          RETURN count(batch) AS count`,
    { url, projectId }
  );
  console.log(
    "Memgraph: Added (:Activity) nodes from JSON",
    records[0].get("count").low
  );
}

const selectActivities = `
    MATCH (p:Project { id: $projectId })
      WITH p
      MATCH (p)-[:OWNS]->(activity:Activity)
      WITH p, activity`;

export async function postProcessActivities({ tx, project }) {
  const projectId = project.id;

  const { records } = await tx.run(
    `${selectActivities}
        CALL uuid_generator.get() YIELD uuid
        MERGE (m:Member { key: p.id + "-" + activity.globalActor })
          ON CREATE SET
            m.id = uuid,
            m.globalActor = activity.globalActor
          SET
            m.globalActorName = activity.globalActorName,
            m.globalActorAvatar = activity.globalActorAvatar
          MERGE (m)-[:DID]->(activity)
          MERGE (p)-[:OWNS]->(m)
          RETURN count(DISTINCT m) AS count`,
    { projectId }
  );
  console.log(
    "Memgraph: Created (:Member) nodes and [:DID] edges",
    records[0].get("count").low
  );

  const { records: identityRecords } = await tx.run(
    `${selectActivities}
        MATCH (m:Member { key: p.id + "-" + activity.globalActor })
        MERGE (i:Identity { key: p.id + "-" + activity.source + "-" + activity.actor })
        ON CREATE SET
          i.source = activity.source,
          i.actor = activity.actor
        SET
          i.actorName = activity.actorName,
          i.actorAvatar = activity.actorAvatar
        MERGE (m)-[:IS]->(i)
        RETURN count(DISTINCT i) AS count`,
    { projectId }
  );
  console.log(
    "Memgraph: Created (:Identity) nodes",
    identityRecords[0].get("count").low
  );

  // needed when older data is imported after newer data
  await mergeConversations({ tx, project });

  // create mentions edges
  const { records: mentionRecords } = await tx.run(
    `${selectActivities}
        WHERE activity.mentions IS NOT NULL
          UNWIND activity.mentions AS actor
          MATCH (i:Identity { key: p.id + "-" + activity.source + "-" + actor })<-[:IS]-(m:Member)
          MERGE (activity)-[r:MENTIONS]->(m)
          RETURN count(r) as count`,
    { projectId }
  );
  console.log(
    "Memgraph: Created [:MENTIONS] edges from activities to members",
    mentionRecords[0].get("count").low
  );

  // for every member that did an activity in the batch
  // find all the places they replied to or mentioned another member
  // and merge an edge between them, adding the activities to the edge
  // the activity ids are a set and so this is idempotent, whereas just
  // incrementing the weight would not be; at the end, set the weight
  // and the lastInteractedAt timestamp
  // this is undirected so that there is only one edge between two people and
  // to create a directional version messaged / messagedBy, only the
  // MERGE (m1)-[k:MESSAGED]-(m2) part needs a direction into m2
  const mergeMessagedEdge = async ({ tx, match }) => {
    return await tx.run(
      `MATCH (p:Project { id: $projectId })
        WITH p
        MATCH (p)-[:OWNS]->(a1:Activity)<-[:DID]-(m1:Member)
        WITH p, a1, m1
         ${match}
         WHERE m1 <> m2
         MATCH (a1)<-[:INCLUDES]-(c:Conversation)
         MERGE (m1)-[k:MESSAGED]-(m2)
         ON CREATE SET k.activities = [a1.id],
                       k.conversationIds = [c.id],
                       k.activityCount = 1,
                       k.conversationCount = 1,
                       k.lastInteractedAt = a1.timestamp
         ON MATCH SET k.activities = CASE
                                     WHEN NOT a1.id IN k.activities THEN k.activities + a1.id
                                     ELSE k.activities
                                     END,
                       k.conversationIds = CASE
                                     WHEN NOT c.id IN k.conversationIds THEN k.conversationIds + c.id
                                     ELSE k.conversationIds
                                     END,
                       k.activityCount = SIZE(k.activities),
                       k.conversationCount = SIZE(k.conversationIds),
                       k.lastInteractedAt = CASE
                                           WHEN k.lastInteractedAt IS NULL OR a1.timestamp > k.lastInteractedAt THEN a1.timestamp
                                           ELSE k.lastInteractedAt
                                           END
                      RETURN count(k) AS count`,
      { projectId }
    );
  };

  const matchByReply = `MATCH (a1)-[:REPLIES_TO]->(a2:Activity)<-[:DID]-(m2:Member)`;
  const { records: records1 } = await mergeMessagedEdge({
    tx,
    match: matchByReply,
  });
  console.log(
    "Memgraph: Created (:Member)-[:MESSAGED]-(:Member) edges for replies",
    records1[0].get("count").low
  );

  const matchByMention = `MATCH (a1)-[:MENTIONS]->(m2:Member)`;
  const { records: records2 } = await mergeMessagedEdge({
    tx,
    match: matchByMention,
  });
  console.log(
    "Memgraph: Created (:Member)-[:MESSAGED]-(:Member) edges for mentions",
    records2[0].get("count").low
  );

  // update (:Member) nodes with an activity conversation count
  // it would be better to do it at query time but graphql sorting
  // doesn't support aggregations and writing a custom resolver
  // is complicated because of pagination, etc.
  const { records: countRecords } = await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(m:Member)-[:DID]->(a:Activity)
        WITH DISTINCT m
          MATCH (m)-[:DID]-(a:Activity)<-[:INCLUDES]-(c:Conversation)
          WITH m, count(DISTINCT a.id) as activityCount, count(DISTINCT c.id) as conversationCount
          OPTIONAL MATCH (m)-[:MESSAGED]-(n:Member)
          WITH m, activityCount, conversationCount, count(DISTINCT n.globalActor) AS messagedWithCount
            SET m.activityCount = activityCount,
            m.conversationCount = conversationCount,
            m.messagedWithCount = messagedWithCount
          RETURN count(m) AS count`,
    { projectId }
  );
  console.log(
    "Memgraph: Updated (:Member) nodes with counts",
    countRecords[0].get("count").low
  );
}

export const mergeConversations = async ({ tx, project }) => {
  const projectId = project.id;

  // assign parentId and :Reply label to activities that have a sourceParentId matching another activity
  // it's possible if older data is important later than reply links won't be there
  const { records } = await tx.run(
    `${selectActivities}
      MATCH (parent:Activity { key: p.id + "-" + activity.sourceParentId })
      MERGE (activity)-[r:REPLIES_TO]->(parent)
      RETURN count(r) AS count`,
    { projectId }
  );
  console.log(
    "Memgraph: Connected (a:Activity)-[:REPLIES_TO]->(b:Activity)",
    records[0].get("count").low
  );

  const { records: records2 } = await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(starter:Activity)<-[:DID]-(m:Member)
        WHERE NOT EXISTS((starter)-[:REPLIES_TO]->(:Activity))
        MERGE (c:Conversation { key: p.id + "-" + starter.id })
        ON CREATE SET
          c.memberCount = 1, c.activityCount = 1,
          c.memberIds = [m.id], c.activityIds = [starter.id],
          c.lastActivityTimestamp = starter.timestamp,
          c.lastActivityTimestampInt = starter.timestampInt,
          c.firstActivityTimestamp = starter.timestamp,
          c.firstActivityTimestampInt = starter.timestampInt,
          c.missingParent = starter.sourceParentId IS NOT NULL,
          c.source = starter.source,
          c.sourceChannel = starter.sourceChannel
        MERGE (p)-[:OWNS]->(c)
        MERGE (c)-[:INCLUDES]->(m)
        MERGE (c)-[:INCLUDES]->(starter)
        MERGE (c)-[:STARTS_WITH]->(starter)
        WITH c, starter
          CALL uuid_generator.get() YIELD uuid
          SET c.id = COALESCE(c.id, uuid)
        WITH c, starter
        MATCH (starter)<-[:REPLIES_TO*0..]-(reply:Activity)<-[:DID]-(member:Member)
        MERGE (c)-[:INCLUDES]->(member)
        MERGE (c)-[:INCLUDES]->(reply)
        ON MATCH SET
          c.lastActivityTimestamp = CASE
                              WHEN c.lastActivityTimestamp < reply.timestamp
                              THEN reply.timestamp
                              ELSE c.lastActivityTimestamp
                            END,
          c.lastActivityTimestampInt = CASE
                              WHEN c.lastActivityTimestampInt < reply.timestampInt
                              THEN reply.timestampInt
                              ELSE c.lastActivityTimestampInt
                            END
        WITH c,
            COLLECT(DISTINCT member.id) AS memberIds,
            COLLECT(DISTINCT reply.id) AS activityIds
        SET c.memberIds = memberIds,
            c.memberCount = size(memberIds),
            c.activityIds = activityIds,
            c.activityCount = size(activityIds)
        RETURN count(c) AS count`,
    { projectId }
  );
  console.log(
    "Memgraph: Merged (Conversation) nodes",
    records2[0].get("count").low
  );

  // if data is imported reverse chronologically, some conversations will no
  // longer be their own conversation but part of another conversation with an
  // earlier starter. in this case, we can delete these, although in the future
  // we could consider doing things like migrating and merging properties
  // to avoid data being delete, importing data chronologically is recommended
  // to find the conversations to remove, we look for any conversation that has
  // a starter with a parent - that is not allowed; we detach delete so that any
  // relationships the conversation has are also deleted
  // do not contrain to activities in activityIds, as a new activity in the batch
  // could be a parent for activities in previous batches, and those activities
  // who now have a parent will need their conversations deleted
  const { records: records3 } = await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(starter:Activity)<-[:STARTS_WITH]-(conversation:Conversation)
          WHERE EXISTS ((starter)-[:REPLIES_TO]->(:Activity))
        WITH conversation
        DETACH DELETE conversation
        RETURN count(conversation) AS count`,
    { projectId }
  );
  console.log(
    "Memgraph: Removed old (Conversation) nodes",
    records3[0].get("count").low
  );
};
