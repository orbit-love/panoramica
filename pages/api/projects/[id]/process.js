import { prisma } from "lib/db";
import { check, redirect, authorizeProject } from "lib/auth";

import GraphConnection from "lib/graphConnection";
import c from "lib/common";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }
  const graphConnection = new GraphConnection();

  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
    }

    const projectId = project.id;

    const activities = await prisma.activity.findMany({
      where: {
        projectId,
      },
      include: {
        parent: true,
      },
    });

    // stringify the timestamps for putting into memgraph
    for (let activity of activities) {
      activity.timestamp = activity.timestamp.toISOString();
    }

    // merge project node
    await graphConnection.run(
      `MERGE (p:Project { id: $projectId })
        RETURN p`,
      { projectId }
    );
    console.log("Memgraph: Created project");

    // delete previous nodes and relationships
    await graphConnection.run(
      `MATCH (p:Project { id: $projectId })-[*..4]->(n)
        DETACH DELETE n`,
      { projectId }
    );
    console.log("Memgraph: Deleted data");

    // ensure only one project with the same id is ever created
    await graphConnection.run(
      `CREATE CONSTRAINT ON (p:Parent) ASSERT p.id IS UNIQUE`
    );
    await graphConnection.run(`CREATE INDEX ON :Project(id)`);
    await graphConnection.run(`CREATE INDEX ON :Member(globalActor)`);
    await graphConnection.run(`CREATE INDEX ON :Activity(id)`);
    await graphConnection.run(`CREATE INDEX ON :Activity(low)`);
    await graphConnection.run(`CREATE INDEX ON :Activity(high)`);
    await graphConnection.run(`CREATE INDEX ON :Activity(timestamp)`);

    console.log("Memgraph: Created uniqueness constraint");

    // bulk add all the activities
    await graphConnection.run(
      `MATCH (p:Project { id: $projectId })
        WITH p, $activities AS batch
          UNWIND batch AS activity
          MERGE (p)-[:OWNS]-(a:Activity { id: activity.id })
           SET a += {
            actor: activity.actor,
            sourceId: activity.sourceId,
            sourceParentId: activity.sourceParentId,
            text: activity.text,
            timestamp: activity.timestamp,
            actorName: activity.actorName,
            textHtml: activity.textHtml,
            url: activity.url,
            tags: activity.tags,
            mentions: activity.mentions,
            entities: activity.entities,
            source: activity.source,
            sourceType: activity.sourceType,
            globalActor: activity.globalActor,
            globalActorName: activity.globalActorName
          }`,
      { activities, projectId }
    );
    console.log("Memgraph: Added (:Activity) nodes - " + activities.length);

    // connect activities to other activities if they are replies
    let parentEdges = [];
    for (let activity of activities) {
      let parent = activity.parent;
      if (parent) {
        parentEdges.push({
          activity,
          parent,
          projectId,
        });
      }
    }

    await graphConnection.run(
      `MATCH (p:Project { id: $projectId })
       WITH p, $parentEdges AS batch
            UNWIND batch AS edge
            MATCH (p)-[:OWNS]->(a:Activity { id: edge.activity.id })
            MATCH (p)-[:OWNS]->(parent:Activity { id: edge.parent.id })
            MERGE (a)-[r:REPLIES_TO]->(parent)`,
      { parentEdges, projectId }
    );
    console.log(
      "Memgraph: Added (a:Activity)-[:REPLIES_TO]->(p:Activity) edges - " +
        parentEdges.length
    );

    // create the set of members for the activities
    // TODO: actors could be an array here, otherwise it just gets overridden
    await graphConnection.run(
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
    await graphConnection.run(
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
    await graphConnection.run(
      `MATCH (p:Project { id: $projectId })
        WITH p, $entities AS batch
          UNWIND batch AS entity
          MERGE (p)-[:OWNS]->(e:Entity { id: entity.id })
          SET e += { } RETURN e`,
      { entities, projectId }
    );
    console.log("Memgraph: Created (:Entity) nodes - ", entities.length);

    await graphConnection.run(
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
    await graphConnection.run(
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

    res.status(200).json({ result: { count: activities.length } });
  } catch (err) {
    console.log("Could not process activities", err);
    return res.status(500).json({ message: "Could not process activities" });
  } finally {
    await graphConnection.close();
  }
}
