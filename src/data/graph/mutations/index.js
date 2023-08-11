import utils from "src/utils";

export async function mergeProject({ project, user, tx }) {
  const { id: projectId, name, demo } = project;
  const { id: userId, email } = user;

  // merge project node
  await tx.run(
    `MERGE (p:Project { id: $projectId })
      WITH p
      SET p.demo = $demo, p.name = $name
      MERGE (p)<-[:CREATED]-(u:User { id: $userId })
      WITH u
        SET u.email = $email`,
    { projectId, userId, email, demo, name }
  );
  console.log("Memgraph: Created project");
}

export async function setupProject({ project, user, tx }) {
  await mergeProject({ project, user, tx });

  const projectId = project.id;
  // delete existing nodes and relationships
  await tx.run(
    `MATCH (p:Project { id: $projectId })-[*..4]->(n)
        DETACH DELETE n`,
    { projectId }
  );
  console.log("Memgraph: Cleared existing project data");
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

export async function syncActivities({ tx, project, user, activities }) {
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
          MERGE (p)-[:OWNS]-(a:Activity { sourceId: activity.sourceId })
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

  // assign parentId and :Reply label to activities that have a sourceParentId matching another activity
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
        UNWIND batch AS activity
          MATCH (p)-[:OWNS]->(a1:Activity { id: activity.id }), (p)-[:OWNS]->(a2:Activity)
            WHERE a1.sourceParentId = a2.sourceId
              MERGE (a1)-[r:REPLIES_TO]->(a2)
              SET a1.parentId = a2.id
              SET a1:Reply`,
    { activities, projectId }
  );
  console.log("Memgraph: Connected (a:Activity)-[:REPLIES_TO]->(p:Activity)");

  // assign conversationId to the farthest ancestor of each activity or that activity itself
  // apply the :Conversation label if the farthest ancestor is the activity itself
  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p, $activities AS batch
      UNWIND batch AS batchActivity
        MATCH path = (p)-[:OWNS]->(ancestor:Activity)<-[:REPLIES_TO*0..]-(activity:Activity { id: batchActivity.id })
          WITH activity, ancestor, reduce(acc = ancestor, n in nodes(path) | CASE WHEN n.timestamp < acc.timestamp THEN n ELSE acc END) as conversationStarter
            ORDER BY conversationStarter.timestamp
          WITH activity, HEAD(COLLECT(conversationStarter.id)) as conversationId
            MATCH (conversation:Activity { id: conversationId })
          WITH activity, conversation, conversationId
            SET activity.conversationId = conversationId
            MERGE (activity)-[:PART_OF]->(conversation)
            SET conversation:Conversation`,
    { activities, projectId }
  );
  console.log("Memgraph: Connected (a:Activity)-[:PART_OF]->(c:Conversation)");

  // create (:Member) nodes for each unique globalActor
  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p, $activities AS batch
        UNWIND batch AS activity
        MERGE (p)-[:OWNS]-(m:Member { globalActor: activity.globalActor })
          SET m.globalActorName = activity.globalActorName`,
    { activities, projectId }
  );
  console.log("Memgraph: Created (:Member) nodes");

  // create [:DID] edges between members and activities
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
            UNWIND batch AS activity
            MATCH (p)-[:OWNS]->(a:Activity { id: activity.id }),
                  (p)-[:OWNS]->(m:Member { globalActor: activity.globalActor })
           MERGE (m)-[r:DID]-(a)`,
    { activities, projectId }
  );
  console.log("Memgraph: Created (:Member)->[:DID]->(:Activity) edges");

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
            MATCH
              (p)-[:OWNS]->(m:Member   { globalActor: mention.globalActor }),
              (p)-[:OWNS]->(a:Activity { id: mention.activityId })
            MERGE (a)-[r:MENTIONS]-(m)`,
    { mentions, projectId }
  );
  console.log(
    "Memgraph: Created (:Activity)-[:MENTIONS]-(:Activity) edges - ",
    mentions.length
  );

  const finalResult = await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p, $activities AS batch
        UNWIND batch AS activity
          MATCH (p)-[:OWNS]-(a:Activity { id: activity.id })
          RETURN a`,
    { activities, projectId }
  );

  // return activities with all new fields loaded
  activities = finalResult.records.map((record) => record.get("a").properties);

  return activities;
}

export const updateActivity = async ({ tx, project, activityId, summary }) => {
  const projectId = project.id;

  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(a:Activity { id: $activityId })
        SET a.summary = $summary`,
    { projectId, activityId, summary }
  );
  console.log("Memgraph: Updated activity");
};
