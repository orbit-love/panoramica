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
    activitiesConnection: async (parent, args, contextValue, info) => {
      console.log(parent, args);
      const graphConnection = new GraphConnection();
      const { id: memberId } = parent;
      const { first, after } = args;
      if (first < 0) throw new Error("first must be positive");

      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)<-[:DID]-(m:Member { id: $memberId })
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
        return record.get("m").properties;
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
        return { ...activity, member };
      });
      return toEdges(activities, first);
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
