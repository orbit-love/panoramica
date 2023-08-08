import GraphConnection from "src/data/graph/Connection";
import { prisma } from "src/data/db";

const resolvers = {
  Query: {
    user: async (parent, args, contextValue, info) => {
      const { user } = contextValue;
      return user;
    },
    projects: async (parent, args, contextValue, info) => {
      const { user } = contextValue;
      var projects = await prisma.project.findMany({
        select: selectClause,
        where: whereClause(null, user),
      });

      return projects;
    },
    project: async (parent, args, contextValue, info) => {
      const { user } = contextValue;
      const { id } = args;
      const project = await prisma.project.findFirst({
        select: selectClause,
        where: whereClause(id, user),
      });
      return project;
    },
  },
  Member: {
    activityCount: async (parent, args, contextValue, info) => {
      const graphConnection = new GraphConnection();
      const { memberId, projectId } = parent;
      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)<-[:DID]-(m:Member { globalActor: $memberId })
          RETURN count(a) AS count`,
        { projectId, memberId }
      );
      return records[0].get("count").low;
    },
    activitiesConnection: async (parent, args, contextValue, info) => {
      const graphConnection = new GraphConnection();
      const { memberId, projectId } = parent;
      const { first, after } = args;
      if (first < 0) throw new Error("first must be positive");

      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)<-[:DID]-(m:Member { globalActor: $memberId })
            WITH a
          RETURN a
            ORDER BY a.timestampInt DESC
            SKIP ${after || 0}`,
        { projectId, memberId }
      );
      var activities = records.map((record) => {
        var activity = record.get("a").properties;
        return { ...activity };
      });
      return toEdges(activities, first);
    },
    connectionCount: async (parent, args, contextValue, info) => {
      const graphConnection = new GraphConnection();
      const { memberId, projectId } = parent;
      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)<-[:DID]-(m:Member { globalActor: $memberId })
            WITH a
            MATCH (a)-[:MENTIONS]->(outgoingMention:Member)
              MERGE (m)-[:KNOWS]->(outgoingMention)
            MATCH (m:incomingMention)-[:DID]->(a)-[:MENTIONS]->(m)
              MERGE (m)-[:KNOWS]->(incomingMention)
            MATCH (a)-[:REPLIES_TO]->(parent)<-[:DID]-(outgoingReply:Member)
              MERGE (m)-[:KNOWS]->(outgoingReply)
            MATCH (m:incomingReply)-[:DID]->(:Activity)-[:REPLIES_TO]->(a)
              MERGE (m)-[:KNOWS]->(incomingReply)
            MATCH (m)-[:KNOWS]->(another:Member)
            RETURN count(another) AS count`,
        { projectId, memberId }
      );
      return records[0].get("count").low;
    },
  },
  Project: {
    membersConnection: async (parent, args, contextValue, info) => {
      const graphConnection = new GraphConnection();
      const { id: projectId } = parent;
      const { first, after } = args;
      if (first < 0) throw new Error("first must be positive");

      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(m:Member)
            RETURN m
            ORDER BY m.id
            SKIP ${after || 0}`,
        { projectId }
      );
      var members = records.map((record) => {
        var member = record.get("m").properties;
        var memberId = member.globalActor;
        // add the projectId to the object so that it can
        // be used in queries deeper in the graph
        return {
          ...member,
          projectId,
          memberId,
        };
      });
      return toEdges(members, first);
    },
    activitiesConnection: async (parent, args, contextValue, info) => {
      const graphConnection = new GraphConnection();
      const { id: projectId } = parent;
      const { first, after } = args;
      if (first < 0) throw new Error("first must be positive");

      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)
            WITH a
          MATCH (a)<-[:DID]-(m:Member)
          RETURN a, m
            ORDER BY a.timestampInt DESC
            SKIP ${after || 0}`,
        { projectId }
      );
      var activities = records.map((record) => {
        var activity = record.get("a").properties;
        var member = record.get("m").properties;
        return {
          ...activity,
          projectId,
          member: { ...member, memberId: member.globalActor, projectId },
        };
      });
      return toEdges(activities, first);
    },
    activitySources: async (parent, args, contextValue, info) => {
      const graphConnection = new GraphConnection();
      const { id: projectId } = parent;
      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)
            WITH DISTINCT(a.source) AS source
          RETURN source`,
        { projectId }
      );
      return records.map((record) => record.get("source"));
    },
  },
};

export default resolvers;

const whereClause = (id, user) => {
  let where = {};
  if (id) {
    where.id = id;
  }
  if (!user.admin) {
    where.OR = [
      {
        user: { email: user.email },
      },
      {
        demo: true,
      },
    ];
  }
  return where;
};

const selectClause = {
  id: true,
  name: true,
  demo: true,
  user: {
    select: {
      email: true,
    },
  },
};

const toEdges = (nodes, first) => {
  var hasNextPage = nodes.length > first;
  nodes = nodes.slice(0, first);
  return {
    edges: nodes.map((node) => ({
      cursor: node.id,
      node,
    })),
    pageInfo: {
      hasNextPage,
    },
  };
};
