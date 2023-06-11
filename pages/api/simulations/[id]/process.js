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
        `CREATE CONSTRAINT ON (a:Activity) ASSERT a.id, a.simulationId IS UNIQUE`
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

      for (let activity of activities) {
        const result = await graphConnection.run(
          `MERGE (a:Activity { id: $id })
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
                 (a:Activity { id: $id })
           MERGE (m)-[r:DID { simulationId: $simulationId }]-(a)`,
          { ...activity }
        );

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
                 (a:Activity { id: $id })
             MERGE (a)-[r:RELATES { simulationId: $simulationId }]-(e)
             RETURN r`,
            { entityId: entity, id: activity.id, simulationId }
          );
          console.log("Created entity node " + entity);
        }

        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        console.log("Created activity node for " + node.properties.globalActor);
      }

      for (let activity of activities) {
        for (var j = 0; j < activity.mentions?.length; j++) {
          var mention = activity.mentions[j];

          // TODO - this is going to cause a lot of craziness, so
          // fix it next - create all members first and then go back
          // and connect via mentions - just throw out mentions to non-members for now
          // it would be confusing with timeframes anyway
          var activityForMention = activities.find(
            (activity) => activity.actor === mention
          );

          // if we have an activity for that mention, we know the
          // member exists at globalActor, so let's proceed
          if (activityForMention) {
            const globalActor = activityForMention.globalActor;
            await graphConnection.run(
              `MATCH (m:Member   { globalActor: $globalActor }),
                   (a:Activity { id: $id })
               MERGE (a)-[r:MENTIONS { simulationId: $simulationId }]-(m)`,
              { globalActor, id: activity.id, simulationId }
            );
            console.log(
              `Connected mention from ${activity.globalActor} to ${globalActor}`
            );
          }
        }
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
