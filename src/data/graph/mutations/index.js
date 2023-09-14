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
    `MATCH (p:Project { id: $projectId })-[:CREATED]-(u:User)
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
    `MATCH (p:Project { id: $projectId })-[*..4]->(n)
        DETACH DELETE n`,
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

export async function syncActivities({ tx, project, activities }) {
  const projectId = project.id;

  for (let activity of activities) {
    activity.timestampInt = Date.parse(activity.timestamp);
  }

  // bulk add all the activities with the help of UNWIND
  // use the sourceId as a key to avoid duplicates
  // don't change the id of the activity, only set when new
  const { records } = await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
          UNWIND batch AS activity
          MERGE (p)-[:OWNS]->(a:Activity { sourceId: activity.sourceId })
           CALL uuid_generator.get() YIELD uuid
           SET a += {
            id: COALESCE(a.id, uuid),
            actor: activity.actor,
            sourceId: activity.sourceId,
            sourceParentId: activity.sourceParentId,
            text: activity.text,
            timestamp: activity.timestamp,
            timestampInt: activity.timestampInt,
            actorName: activity.actorName,
            textHtml: activity.textHtml,
            url: activity.url,
            tags: activity.tags,
            mentions: activity.mentions,
            source: activity.source,
            sourceType: activity.sourceType,
            sourceChannel: activity.sourceChannel,
            globalActor: activity.globalActor,
            globalActorName: activity.globalActorName
          } RETURN a`,
    { activities, projectId }
  );
  console.log("Memgraph: Added (:Activity) nodes - " + activities.length);

  // get the activities back from the result and assign them to the activities array
  // since some may have been created with a new uuid
  activities = records.map((record) => record.get("a").properties);
  const activityIds = activities.map((activity) => activity.id);

  // create (:Member) nodes for each unique globalActor
  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p, $activities AS batch
        UNWIND batch AS activity
        MERGE (p)-[:OWNS]->(m:Member { globalActor: activity.globalActor })
           CALL uuid_generator.get() YIELD uuid
           SET m += {
             id: COALESCE(m.id, uuid),
             globalActorName: activity.globalActorName
           }`,
    { activities, projectId }
  );
  console.log("Memgraph: Created (:Member) nodes");

  // create [:DID] edges between members and activities
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p
        MATCH (p)-[:OWNS]->(a:Activity)
          WHERE a.id IN $activityIds
          WITH a
            MATCH (p)-[:OWNS]->(m:Member { globalActor: a.globalActor })
          WITH a, m
            MERGE (m)-[:DID]->(a)`,
    { activityIds, projectId }
  );
  console.log("Memgraph: Created (:Member)->[:DID]->(:Activity) edges");

  // needed when older data is imported after newer data
  await mergeConversations({ tx, activities, project });

  let mentions = [];

  // create [:MENTIONS] edges from activities to members
  for (let activity of activities) {
    const activityMentions = (activity.mentions || []).filter(utils.onlyUnique);
    for (let mention of activityMentions) {
      // find some activity where the actor is the same to try
      // and get the global actor
      var activityForMention = activities.find(
        (activity) => activity.actor === mention
      );

      // if we have an activity for that mention, we know the
      // member exists at globalActor, so let's proceed
      if (activityForMention) {
        const globalActor = activityForMention.globalActor;
        mentions.push({
          globalActor,
          activityId: activity.id,
          projectId,
        });
      }
    }
  }
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $mentions AS batch
          UNWIND batch AS mention
            MATCH (p)-[:OWNS]->(m:Member   { globalActor: mention.globalActor })
            MATCH (p)-[:OWNS]->(a:Activity { id: mention.activityId })
            MERGE (a)-[:MENTIONS]-(m)`,
    { mentions, projectId }
  );
  console.log(
    "Memgraph: Created (:Activity)-[:MENTIONS]-(:Activity) edges - ",
    mentions.length
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
       MATCH (p)-[:OWNS]->(a:Activity)<-[:DID]-(m1:Member)
         WHERE a.id IN $activityIds
         WITH DISTINCT(m1) AS m1
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
                                           END`,
      { activityIds, projectId }
    );
  };

  const matchByReply = `MATCH (m1)-[:DID]->(a1:Activity)-[:REPLIES_TO]->(a2:Activity)<-[:DID]-(m2:Member)`;
  await mergeMessagedEdge({ tx, match: matchByReply });
  console.log(
    "Memgraph: Created (:Member)-[:MESSAGED]-(:Member) edges for replies"
  );

  const matchByMention = `MATCH (m1)-[:DID]->(a1:Activity)-[:MENTIONS]->(m2:Member)`;
  await mergeMessagedEdge({ tx, match: matchByMention });
  console.log(
    "Memgraph: Created (:Member)-[:MESSAGED]-(:Member) edges for mentions"
  );

  // update (:Member) nodes with an activity conversation count
  // it would be better to do it at query time but graphql sorting
  // doesn't support aggregations and writing a custom resolver
  // is complicated because of pagination, etc.
  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(m:Member)-[:DID]->(a:Activity)
        WHERE a.id IN $activityIds
        WITH DISTINCT(m)
          MATCH (m)-[:DID]-(a:Activity)<-[:INCLUDES]-(c:Conversation)
          WITH m, count(DISTINCT a.id) as activityCount, count(DISTINCT c.id) as conversationCount
          OPTIONAL MATCH (m)-[:MESSAGED]-(n:Member)
          WITH m, activityCount, conversationCount, count(DISTINCT n.globalActor) AS messagedWithCount
            SET m.activityCount = activityCount,
            m.conversationCount = conversationCount,
            m.messagedWithCount = messagedWithCount`,
    { activityIds, projectId }
  );
  console.log("Memgraph: Updated (:Member) nodes with counts");

  const finalResult = await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(a:Activity)<-[:INCLUDES]-(c:Conversation)
        WHERE a.id IN $activityIds
        RETURN a, c`,
    { activityIds, projectId }
  );

  // return activities with all new fields loaded
  activities = finalResult.records.map((record) => ({
    ...record.get("a").properties,
    conversation: record.get("c").properties,
  }));

  return activities;
}

export const mergeConversations = async ({ tx, activities, project }) => {
  const projectId = project.id;
  const activityIds = activities.map((activity) => activity.id);

  // assign parentId and :Reply label to activities that have a sourceParentId matching another activity
  // it's possible if older data is important later than reply links won't be there
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p
        MATCH (p)-[:OWNS]->(a1:Activity)
          WHERE a1.id IN $activityIds
          WITH a1
            MATCH (p)-[:OWNS]->(a2:Activity)
              WHERE a1.sourceParentId = a2.sourceId
            MERGE (a1)-[r:REPLIES_TO]->(a2)`,
    { activityIds, projectId }
  );
  console.log("Memgraph: Connected (a:Activity)-[:REPLIES_TO]->(p:Activity)");

  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(starter:Activity)<-[:DID]-(m:Member)
        WHERE starter.id IN $activityIds AND
          NOT EXISTS((starter)-[:REPLIES_TO]->(:Activity))
        MERGE (p)-[:OWNS]->(c:Conversation { id: starter.id })
        ON CREATE SET
          c.firstActivityTimestamp = starter.timestamp,
          c.lastActivityTimestamp = starter.timestamp,
          c.memberCount = 1, c.activityCount = 1,
          c.members = [m.id],
          c.missingParent = starter.sourceParentId,
          c.source = starter.source,
          c.sourceChannel = starter.sourceChannel
        MERGE (c)-[:INCLUDES]->(starter)
        MERGE (c)-[:INCLUDES]->(member)
        MERGE (c)<-[:BEGINS]-(starter)
        WITH c, starter
        MATCH (starter)<-[:REPLIES_TO*0..]-(reply:Activity)<-[:DID]-(member:Member)
        MERGE (c)-[:INCLUDES]->(reply)
        MERGE (c)-[:INCLUDES]->(member)
        ON MATCH SET
          c.timestampLast = CASE
                              WHEN c.timestampLast < reply.timestamp
                              THEN reply.timestamp
                              ELSE c.timestampLast
                            END,
          c.activityCount = c.activityCount + 1
        WITH c, collect(DISTINCT member.id) AS memberIds
        SET c.memberCount = size(memberIds), c.members = memberIds`,
    { activityIds, projectId }
  );
  console.log("Memgraph: Merged (Conversation) nodes");

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
  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(starter:Activity)-[:BEGINS]->(conversation:Conversation)
          WHERE EXISTS ((starter)-[:REPLIES_TO]->(:Activity))
        WITH conversation
        DETACH DELETE conversation`,
    { projectId }
  );
  console.log("Memgraph: Removed old (Conversation) nodes");
};
