import c from "lib/common";
import { prisma } from "lib/db";

export async function syncProject({ project, tx }) {
  await setupProject({ project, tx });

  const projectId = project.id;
  const activities = await prisma.activity.findMany({
    where: {
      projectId,
    },
  });

  return syncActivities({ project, activities, tx });
}

export async function setupProject({ project, tx }) {
  const projectId = project.id;

  // merge project node
  await tx.run(
    `MERGE (p:Project { id: $projectId })
        RETURN p`,
    { projectId }
  );
  console.log("Memgraph: Created project");

  // delete previous nodes and relationships
  await tx.run(
    `MATCH (p:Project { id: $projectId })-[*..4]->(n)
        DETACH DELETE n`,
    { projectId }
  );
  console.log("Memgraph: Deleted data");

  // ensure only one project with the same id is ever created
  await tx.run(`CREATE CONSTRAINT ON (p:Parent) ASSERT p.id IS UNIQUE`);
  await tx.run(`CREATE INDEX ON :Project(id)`);
  await tx.run(`CREATE INDEX ON :Member(globalActor)`);
  await tx.run(`CREATE INDEX ON :Activity(id)`);
  await tx.run(`CREATE INDEX ON :Activity(timestamp)`);

  console.log("Memgraph: Created uniqueness constraint");
}

export async function syncActivities({ tx, project, activities }) {
  const projectId = project.id;

  // stringify the timestamps for putting into memgraph
  for (let activity of activities) {
    activity.timestamp = activity.timestamp.toISOString();
    activity.timestampInt = Date.parse(activity.timestamp);
  }

  // bulk add all the activities
  // use the sourceId as a key, so even if the database has a different
  // record for the activity, a duplicate won't be created
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
          UNWIND batch AS activity
          MERGE (p)-[:OWNS]-(a:Activity { sourceId: activity.sourceId })
           SET a += {
            id: activity.id,
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
            entities: activity.entities,
            source: activity.source,
            sourceType: activity.sourceType,
            sourceChannel: activity.sourceChannel,
            globalActor: activity.globalActor,
            globalActorName: activity.globalActorName
          }`,
    { activities, projectId }
  );
  console.log("Memgraph: Added (:Activity) nodes - " + activities.length);

  // this runs across all activities, not just ones in the function argument
  // this ensures the new activities will be attached as replies to activities
  // not in the incoming batch
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p
          MATCH (p)-[:OWNS]->(a1:Activity), (p)-[:OWNS]->(a2:Activity)
          WHERE a1.sourceParentId = a2.sourceId
          MERGE (a1)-[r:REPLIES_TO]->(a2)`,
    { projectId }
  );
  console.log("Memgraph: Added (a:Activity)-[:REPLIES_TO]->(p:Activity) edges");

  // assign parentId and conversationId for convenience - these never change
  // children do, so they should be fetched at query time
  // await tx.run(
  //   `MATCH (p:Project { id: $projectId })
  //     WITH p
  //       MATCH (p)-[:OWNS]->(a1:Activity), (p)-[:OWNS]->(a2:Activity)
  //       WHERE a1.sourceParentId = a2.sourceId
  //       MERGE (a1)-[r:REPLIES_TO]->(a2)`,
  //   { projectId }
  // );
  // console.log("Memgraph: Added parentId and conversationId");

  const getCount = ({ records }) => {
    return records[0].get("count");
  };

  // add the Conversation label to activities with replies and no parent
  const conversations = await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p
          MATCH (p)-[:OWNS]->(a:Activity)
            WHERE EXISTS((a)<-[:REPLIES_TO]-()) AND NOT EXISTS((a)-[:REPLIES_TO]->())
          SET a:Conversation
          WITH count(a) as count RETURN count`,
    { projectId }
  );
  console.log(
    "Memgraph: Added (:Conversation) labels - " + getCount(conversations)
  );

  // add the Reply label to activities with a parent
  const replies = await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p
          MATCH (p)-[:OWNS]->(a:Activity)
            WHERE EXISTS((a)-[:REPLIES_TO]->())
          SET a:Reply
          WITH count(a) as count RETURN count`,
    { projectId }
  );
  console.log("Memgraph: Added (:Reply) labels - " + getCount(replies));

  // add the Island label to activities with a parent
  const islands = await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p
          MATCH (p)-[:OWNS]->(a:Activity)
            WHERE NOT EXISTS((a)<-[:REPLIES_TO]-()) AND NOT EXISTS((a)-[:REPLIES_TO]->())
          SET a:Island
          WITH count(a) as count RETURN count`,
    { projectId }
  );
  console.log("Memgraph: Added (:Island) labels - " + getCount(islands));

  // create the set of members for the activities
  // TODO: actors could be an array here, otherwise it just gets overridden
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
          UNWIND batch AS activity
          MERGE (p)-[:OWNS]-(m:Member { globalActor: activity.globalActor })
          SET m += {
           globalActorName: activity.globalActorName,
           actor: activity.actor,
           actorName: activity.actorName
          }`,
    { activities, projectId }
  );
  console.log("Memgraph: Created (:Member) nodes");

  // create the :DID edge between Members and Activities
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
            UNWIND batch AS activity
            MATCH (p)-[:OWNS]->(m:Member { globalActor: activity.globalActor }),
                  (p)-[:OWNS]->(a:Activity { id: activity.id })
           MERGE (m)-[r:DID]-(a)`,
    { activities, projectId }
  );
  console.log(
    "Memgraph: Created (:Member)->[:DID]->(:Activity) edges - " +
      activities.length
  );

  var entities = [];
  var connections = [];

  // create Entity nodes and :RELATES edges to connect them to activities
  for (let activity of activities) {
    for (let entity of activity.entities || []) {
      entities.push({ id: entity, projectId });
      connections.push({
        entityId: entity,
        activityId: activity.id,
        projectId,
      });
    }
  }
  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $entities AS batch
          UNWIND batch AS entity
          MERGE (p)-[:OWNS]->(e:Entity { id: entity.id })
          SET e += { } RETURN e`,
    { entities, projectId }
  );
  console.log("Memgraph: Created (:Entity) nodes - ", entities.length);

  await tx.run(
    `MATCH (p:Project { id: $projectId })
        WITH p, $connections AS batch
        UNWIND batch AS connection
        MATCH (p)-[:OWNS]->(e:Entity { id: connection.entityId }),
              (p)-[:OWNS]->(a:Activity { id: connection.activityId })
          MERGE (a)-[r:RELATES]-(e)`,
    { connections, projectId }
  );
  console.log(
    "Memgraph: Created (:Entity)-[:RELATES]-(:Activity) edges - ",
    connections.length
  );

  let mentions = [];

  // not that all the the member nodes exist, we can look them up by their
  // actor property and create :MENTIONS edges from Activity to Member
  // go back through all the activities and create mentions
  for (let activity of activities) {
    const activityMentions = (activity.mentions || []).filter(c.onlyUnique);
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

  return activities.length;
}
