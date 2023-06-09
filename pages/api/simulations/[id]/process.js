import { PrismaClient } from "@prisma/client";
import neo4j from "neo4j-driver";

const prisma = new PrismaClient();

export default async function handler(req, res) {
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

    const uri = process.env.MEMGRAPH_URI;
    const username = process.env.MEMGRAPH_USERNAME;
    const password = process.env.MEMGRAPH_PASSWORD;

    const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    const session = driver.session();

    try {
      await session.run(
        `MATCH (n)-[r]-(m) WHERE n.simulationId=$simulationId
         DETACH DELETE n, r, m`,
        { simulationId }
      );

      // unique within simulation
      await session.run(
        `CREATE CONSTRAINT ON (a:Activity) ASSERT a.activityId, a.simulationId IS UNIQUE`
      );
      await session.run(
        `CREATE CONSTRAINT ON (a:Activity) ASSERT a.sourceId, a.simulationId IS UNIQUE`
      );
      await session.run(
        `CREATE CONSTRAINT ON (m:Member) ASSERT m.globalActor, m.simulationId IS UNIQUE`
      );
      await session.run(
        `CREATE CONSTRAINT ON (e:Entity) ASSERT e.entityId, e.simulationId IS UNIQUE`
      );

      console.log("Removed old activities and set constraints");

      for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];
        const result = await session.run(
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
            sourceType: $sourceType,
            globalActor: $globalActor,
            globalActorName: $globalActorName
          } RETURN a`,
          { ...activity, timestamp: activity.timestamp.toISOString() }
        );
        // to create the member, we would add local actors to an array
        // instead of overriding
        await session.run(
          `MERGE (m:Member { globalActor: $globalActor })
           SET m += {
           globalActorName: $globalActorName,
           actor: $actor,
           actorName: $actorName,
           simulationId: $simulationId
          } RETURN m`,
          { ...activity }
        );

        await session.run(
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
          await session.run(
            `MERGE (m:Member { actor: $actor })
             SET m += {
               simulationId: $simulationId
             } RETURN m`,
            { actor: mention, actorName: mention, simulationId }
          );

          await session.run(
            `MATCH (m:Member   { actor: $actor }),
                   (a:Activity { activityId: $activityId })
           MERGE (a)-[r:MENTIONS { simulationId: $simulationId }]-(m)`,
            { actor: mention, activityId: activity.id, simulationId }
          );
        }

        for (var j = 0; j < activity.entities?.length; j++) {
          var entity = activity.entities[j];
          await session.run(
            `MERGE (e:Entity { entityId: $entityId })
             SET e += {
              simulationId: $simulationId
             } RETURN e`,
            { entityId: entity, simulationId }
          );
          await session.run(
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
      await session.close();
    }

    await driver.close();

    res.status(200).json({ result: { count: activities.length } });
    console.log("Successfully processed " + activities.length + " activities");
  } catch (err) {
    console.log("Could not process activities", err);
    return res.status(500).json({ message: "Could not process activities" });
  }
}
