import { prisma } from "src/data/db";
import GraphConnection from "src/data/graph/Connection";
import getSimilarConversations from "src/graphql/resolvers/getSimilarConversations";
import searchConversations from "src/graphql/resolvers/searchConversations";
import resolveCompletion from "src/graphql/resolvers/activity/completion";
import resolveGenerateProperties from "src/graphql/resolvers/activity/generateProperties";
import resolveConversationJson from "src/graphql/resolvers/activity/conversationJson";

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
      return records.map((record) => record.get("source")) || [];
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
      return (
        records
          .map((record) => ({
            name: record.get("name"),
            activityCount: record.get("activityCount").low,
            lastActivityAt: record.get("lastActivityAt"),
          }))
          .filter((record) => record.name) || []
      );
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
    async completion(parent, args, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: activityId } = parent;
      const { prompt, modelName, temperature } = args;
      return resolveCompletion({
        projectId,
        activityId,
        prompt,
        modelName,
        temperature,
      });
    },
    async generateProperties(parent, args, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: activityId } = parent;
      const { definitions, modelName, temperature } = args;
      return resolveGenerateProperties({
        projectId,
        activityId,
        definitions,
        modelName,
        temperature,
      });
    },
    async conversationJson(parent, _, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: activityId } = parent;
      const messages = await resolveConversationJson({
        projectId,
        activityId,
      });
      return JSON.stringify(messages);
    },
    async similarConversations(parent) {
      const { id: activityId, project, descendants } = parent;
      if (!project || !descendants) {
        // these fields must be included in the query
        return [
          {
            id: "Please add project.id, descendants.id, and descendants.textHtml to the activity selection.",
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
