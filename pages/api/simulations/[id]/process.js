import { prisma } from "lib/db";
import GraphConnection from "lib/graphConnection";
import c from "lib/common";

export default async function handler(req, res) {
  const graphConnection = new GraphConnection();

  const { id } = req.query;
  const simulationId = parseInt(id);
  try {
    const simulation = await prisma.simulation.findUnique({
      where: {
        id: simulationId,
      },
    });

    const activities = await prisma.activity.findMany({
      where: {
        simulationId: simulation.id,
      },
    });

    // stringify the timestamps for putting into memgraph
    for (let activity of activities) {
      activity.timestamp = activity.timestamp.toISOString();
    }

    // delete previous nodes and relationships
    await graphConnection.run(
      `MATCH (n) WHERE n.simulationId=$simulationId
        DETACH DELETE n`,
      { simulationId }
    );

    // unique within simulation
    await graphConnection.run(
      `CREATE CONSTRAINT ON (a:Activity) ASSERT a.id, a.simulationId IS UNIQUE`
    );
    await graphConnection.run(
      `CREATE CONSTRAINT ON (a:Activity) ASSERT a.sourceId, a.simulationId IS UNIQUE`
    );
    await graphConnection.run(
      `CREATE CONSTRAINT ON (m:Member) ASSERT m.globalActor, m.simulationId IS UNIQUE`
    );
    await graphConnection.run(
      `CREATE CONSTRAINT ON (e:Entity) ASSERT e.id, e.simulationId IS UNIQUE`
    );

    console.log("Memgraph: Removed old data and applied constraints");

    await graphConnection.run(
      `WITH $activities AS batch
           UNWIND batch AS activity
           MERGE (a:Activity { id: activity.id })
           SET a += {
            actor: activity.actor,
            sourceId: activity.sourceId,
            text: activity.text,
            timestamp: activity.timestamp,
            simulationId: activity.simulationId,
            actorName: activity.actorName,
            textHtml: activity.textHtml,
            url: activity.url,
            tags: activity.tags,
            mentions: activity.mentions,
            entities: activity.entities,
            sourceType: activity.sourceType,
            globalActor: activity.globalActor,
            globalActorName: activity.globalActorName
          } RETURN a`,
      { activities }
    );

    await graphConnection.run(
      `WITH $activities AS batch
          UNWIND batch AS activity
          MERGE (m:Member { globalActor: activity.globalActor })
           SET m += {
           globalActorName: activity.globalActorName,
           actor: activity.actor,
           actorName: activity.actorName,
           simulationId: activity.simulationId
          } RETURN m`,
      { activities }
    );

    await graphConnection.run(
      `WITH $activities AS batch
            UNWIND batch AS activity
            MATCH (m:Member   { globalActor: activity.globalActor }),
                 (a:Activity { id: activity.id })
           MERGE (m)-[r:DID { simulationId: activity.simulationId }]-(a)`,
      { activities }
    );

    var entities = [];
    var connections = [];

    for (let activity of activities) {
      for (let entity of activity.entities || []) {
        entities.push({ id: entity, simulationId });
        connections.push({
          entityId: entity,
          activityId: activity.id,
          simulationId,
        });
      }
    }

    await graphConnection.run(
      `WITH $entities AS batch
          UNWIND batch AS entity
          MERGE (e:Entity { id: entity.id })
          SET e += {
          simulationId: entity.simulationId
          } RETURN e`,
      { entities }
    );
    await graphConnection.run(
      `WITH $connections AS batch
        UNWIND batch AS connection
        MATCH (e:Entity { id: connection.entityId }),
              (a:Activity { id: connection.activityId })
          MERGE (a)-[r:RELATES { simulationId: connection.simulationId }]-(e)
          RETURN r`,
      { connections }
    );

    let mentions = [];

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
            simulationId,
          });
        }
      }
    }
    await graphConnection.run(
      `WITH $mentions AS batch
          UNWIND batch AS mention
            MATCH (m:Member   { globalActor: mention.globalActor }),
              (a:Activity { id: mention.activityId })
          MERGE (a)-[r:MENTIONS { simulationId: mention.simulationId }]-(m)`,
      { mentions }
    );
    console.log(`Connected ${mentions.length} mentions`);

    res.status(200).json({ result: { count: activities.length } });
    console.log("Successfully processed " + activities.length + " activities");
  } catch (err) {
    console.log("Could not process activities", err);
    return res.status(500).json({ message: "Could not process activities" });
  } finally {
    await graphConnection.close();
  }
}
