import { prisma } from "lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

import GraphConnection from "lib/graphConnection";
import c from "lib/common";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  const graphConnection = new GraphConnection();

  const { id } = req.query;
  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        user: {
          email: user.email,
        },
      },
    });

    if (!project) {
      return res.status(401).json({ message: "Not authorized" });
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

    // delete previous nodes and relationships
    await graphConnection.run(
      `MATCH (n) WHERE n.projectId=$projectId
        DETACH DELETE n`,
      { projectId }
    );

    // unique within project
    await graphConnection.run(
      `CREATE CONSTRAINT ON (a:Activity) ASSERT a.id, a.projectId IS UNIQUE`
    );
    await graphConnection.run(
      `CREATE CONSTRAINT ON (a:Activity) ASSERT a.sourceId, a.projectId IS UNIQUE`
    );
    await graphConnection.run(
      `CREATE CONSTRAINT ON (m:Member) ASSERT m.globalActor, m.projectId IS UNIQUE`
    );
    await graphConnection.run(
      `CREATE CONSTRAINT ON (e:Entity) ASSERT e.id, e.projectId IS UNIQUE`
    );

    console.log("Memgraph: Removed old data and applied constraints");

    await graphConnection.run(
      `WITH $activities AS batch
           UNWIND batch AS activity
           MERGE (a:Activity { id: activity.id })
           SET a += {
            actor: activity.actor,
            sourceId: activity.sourceId,
            sourceParentId: activity.sourceParentId,
            text: activity.text,
            timestamp: activity.timestamp,
            projectId: activity.projectId,
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
      `WITH $parentEdges AS batch
            UNWIND batch AS edge
            MATCH (a:Activity   { id: edge.activity.id }),
                  (p:Activity { id: edge.parent.id })
           MERGE (a)-[r:REPLIES_TO { projectId: edge.projectId }]-(p)`,
      { parentEdges }
    );

    await graphConnection.run(
      `WITH $activities AS batch
          UNWIND batch AS activity
          MERGE (m:Member { globalActor: activity.globalActor })
           SET m += {
           globalActorName: activity.globalActorName,
           actor: activity.actor,
           actorName: activity.actorName,
           projectId: activity.projectId
          } RETURN m`,
      { activities }
    );

    await graphConnection.run(
      `WITH $activities AS batch
            UNWIND batch AS activity
            MATCH (m:Member   { globalActor: activity.globalActor }),
                 (a:Activity { id: activity.id })
           MERGE (m)-[r:DID { projectId: activity.projectId }]-(a)`,
      { activities }
    );

    var entities = [];
    var connections = [];

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
      `WITH $entities AS batch
          UNWIND batch AS entity
          MERGE (e:Entity { id: entity.id })
          SET e += {
          projectId: entity.projectId
          } RETURN e`,
      { entities }
    );
    await graphConnection.run(
      `WITH $connections AS batch
        UNWIND batch AS connection
        MATCH (e:Entity { id: connection.entityId }),
              (a:Activity { id: connection.activityId })
          MERGE (a)-[r:RELATES { projectId: connection.projectId }]-(e)
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
            projectId,
          });
        }
      }
    }
    await graphConnection.run(
      `WITH $mentions AS batch
          UNWIND batch AS mention
            MATCH (m:Member   { globalActor: mention.globalActor }),
              (a:Activity { id: mention.activityId })
          MERGE (a)-[r:MENTIONS { projectId: mention.projectId }]-(m)`,
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
