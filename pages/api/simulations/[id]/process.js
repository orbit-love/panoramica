import { PrismaClient } from "@prisma/client";
import GraphConnection from "lib/graphConnection";

const prisma = new PrismaClient();

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

    try {
      // delete previous nodes and relationships
      await graphConnection.run(
        `MATCH (n) WHERE n.simulationId=$simulationId
        DETACH DELETE n`,
        { simulationId }
      );

      // unique within simulation
      await graphConnection.run(
        `CREATE CONSTRAINT ON (a:Activity) ASSERT a.activityId, a.simulationId IS UNIQUE`
      );
      await graphConnection.run(
        `CREATE CONSTRAINT ON (a:Activity) ASSERT a.sourceId, a.simulationId IS UNIQUE`
      );
      await graphConnection.run(
        `CREATE CONSTRAINT ON (m:Member) ASSERT m.globalActor, m.simulationId IS UNIQUE`
      );
      await graphConnection.run(
        `CREATE CONSTRAINT ON (e:Entity) ASSERT e.entityId, e.simulationId IS UNIQUE`
      );

      console.log("Removed old activities and set constraints");

      for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];
        const result = await graphConnection.run(
          `MERGE (a:Activity { activityId: $id })
           SET a += {
            actor: $actor,
            sourceId: $sourceId,
            timestamp: $timestamp,
            text: $text,
            simulationId: $simulationId,
            actorName: $actorName,
            textHtml: $textHtml,
            url: $url,
            tags: $tags,
            mentions: $mentions,
            entities: $entities,
            sourceType: $sourceType,
            globalActor: $globalActor,
            globalActorName: $globalActorName
          } RETURN a`,
          { ...activity, timestamp: activity.timestamp.toISOString() }
        );
        // to create the member, we would add local actors to an array
        // instead of overriding
        await graphConnection.run(
          `MERGE (m:Member { globalActor: $globalActor })
           SET m += {
           globalActorName: $globalActorName,
           actor: $actor,
           actorName: $actorName,
           simulationId: $simulationId
          } RETURN m`,
          { ...activity }
        );

        await graphConnection.run(
          `MATCH (m:Member   { globalActor: $globalActor }),
                 (a:Activity { activityId: $id })
           MERGE (m)-[r:DID { simulationId: $simulationId }]-(a)`,
          { ...activity }
        );

        for (var j = 0; j < activity.mentions?.length; j++) {
          var mention = activity.mentions[j];

          // create a member with only actor, not global actor, since don't know it
          // a pass after could clean this up, we try to find a global actor with
          // the local actor; maybe a new schema field - actorSource=twitter e.g.
          await graphConnection.run(
            `MERGE (m:Member { actor: $actor })
             SET m += {
               simulationId: $simulationId
             } RETURN m`,
            { actor: mention, actorName: mention, simulationId }
          );

          await graphConnection.run(
            `MATCH (m:Member   { actor: $actor }),
                   (a:Activity { activityId: $activityId })
           MERGE (a)-[r:MENTIONS { simulationId: $simulationId }]-(m)`,
            { actor: mention, activityId: activity.id, simulationId }
          );
        }

        for (var j = 0; j < activity.entities?.length; j++) {
          var entity = activity.entities[j];
          await graphConnection.run(
            `MERGE (e:Entity { entityId: $entityId })
             SET e += {
              simulationId: $simulationId
             } RETURN e`,
            { entityId: entity, simulationId }
          );
          await graphConnection.run(
            `MATCH (e:Entity { entityId: $entityId }),
                 (a:Activity { activityId: $activityId })
             MERGE (a)-[r:RELATES { simulationId: $simulationId }]-(e)
             RETURN r`,
            { entityId: entity, activityId: activity.id, simulationId }
          );
          console.log("Created entity node " + entity);
        }

        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        console.log("Created activity node for " + node.properties.globalActor);
      }
    } finally {
      await graphConnection.close();
    }

    res.status(200).json({ result: { count: activities.length } });
    console.log("Successfully processed " + activities.length + " activities");
  } catch (err) {
    console.log("Could not process activities", err);
    return res.status(500).json({ message: "Could not process activities" });
  }
}
