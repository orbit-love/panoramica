import { prisma } from "src/data/db";
import GraphConnection from "src/data/graph/Connection";
import getSimilarConversations from "src/graphql/resolvers/similarConversations";
import searchConversations from "src/graphql/resolvers/searchConversations";

const resolvers = {
  Query: {
    prismaUser: async (parent, args, contextValue) => {
      const { user } = contextValue;
      return user;
    },
    prismaProjects: async (parent, args, contextValue) => {
      const { user } = contextValue;
      var projects = await prisma.project.findMany({
        select: selectClause,
        where: whereClause(null, user),
      });
      for (let project of projects) {
        project.prismaUser = project.user;
      }

      return projects;
    },
    prismaProject: async (parent, args, contextValue) => {
      const { user } = contextValue;
      const { id } = args;
      const project = await prisma.project.findFirst({
        select: selectClause,
        where: whereClause(id, user),
      });
      project.prismaUser = project.user;
      return project;
    },
  },
  Project: {
    async sources(parent) {
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
    async sourceChannels(parent, args) {
      const graphConnection = new GraphConnection();
      const { id: projectId } = parent;
      const { source } = args;
      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(a:Activity)
            WHERE a.source = $source
            WITH
              DISTINCT(a.sourceChannel) AS name
            WITH name
              MATCH (p)-[:OWNS]->(a:Activity {sourceChannel: name})
            WITH name,
                COUNT(a) AS activityCount,
                MAX(a.timestamp) AS lastActivityAt
          RETURN name, activityCount, lastActivityAt
          ORDER BY lastActivityAt DESC`,
        { projectId, source }
      );
      return records
        .map((record) => ({
          name: record.get("name"),
          activityCount: record.get("activityCount").low,
          lastActivityAt: record.get("lastActivityAt"),
        }))
        .filter((record) => record.name);
    },
    async searchConversations(parent, args) {
      const { id: projectId } = parent;
      const { query } = args;
      if (query === "do-not-search") {
        return [];
      } else {
        return searchConversations({
          projectId,
          query,
        });
      }
    },
  },
  Activity: {
    async similarConversations(parent) {
      const { id: activityId, project, descendants } = parent;
      if (!project || !descendants) {
        // these fields must be included in the query
        return [
          {
            id: "Please include project.id, descendants.id, and descendants.textHtml in the selection.",
            score: 0.0,
          },
        ];
      }
      const { id: projectId } = project;
      return getSimilarConversations({
        projectId,
        activityId,
        descendants,
      });
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
    ];
  }
  return where;
};

const selectClause = {
  id: true,
  name: true,
  demo: true,
  workspace: true,
  url: true,
  pineconeApiEnv: true,
  pineconeIndexName: true,
  modelName: true,
  user: {
    select: {
      id: true,
      email: true,
    },
  },
};
