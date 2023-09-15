import { prisma } from "src/data/db";
import GraphConnection from "src/data/graph/Connection";
import getSimilarConversations from "src/graphql/resolvers/getSimilarConversations";
import searchConversations from "src/graphql/resolvers/searchConversations";
import resolveCompletion from "src/graphql/resolvers/conversation/completion";
import resolveGenerateProperties from "src/graphql/resolvers/conversation/generateProperties";
import resolveGeneratePropertiesFromYaml from "src/graphql/resolvers/conversation/generatePropertiesFromYaml";
import resolveConversationJson from "src/graphql/resolvers/conversation/conversationJson";
import resolvePropertyFilters from "src/graphql/resolvers/project/propertyFilters";
import { aiReady } from "src/integrations/ready";
import { getQaSummaries } from "./resolvers/getQaSummaries";
import { searchQas } from "./resolvers/searchQas";

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
        cleanupProject(project);
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
      cleanupProject(project);
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
          MATCH (p)-[:OWNS]->(c:Conversation)
            WITH
              DISTINCT(c.source) AS name,
              COUNT(c) AS conversationCount,
              MAX(c.lastActivityTimestamp) AS lastActivityTimestamp
          RETURN name, conversationCount, lastActivityTimestamp
            ORDER BY lastActivityTimestamp DESC`,
        { projectId }
      );
      return (
        records
          .map((record) => ({
            name: record.get("name"),
            conversationCount: record.get("conversationCount").low,
            lastActivityTimestamp: record.get("lastActivityTimestamp"),
          }))
          .filter((record) => record.name) || []
      );
    },
    async sourceChannels(parent, args) {
      const graphConnection = new GraphConnection();
      const { id: projectId } = parent;
      const { source } = args;
      const { records } = await graphConnection.run(
        `MATCH (p:Project { id: $projectId })
            WITH p
          MATCH (p)-[:OWNS]->(c:Conversation)
            WHERE c.source = $source
            WITH DISTINCT(c.sourceChannel) AS name,
                COUNT(c) AS conversationCount,
                MAX(c.lastActivityTimestamp) AS lastActivityTimestamp
          RETURN name, conversationCount, lastActivityTimestamp
            ORDER BY lastActivityTimestamp DESC`,
        { projectId, source }
      );
      return (
        records
          .map((record) => ({
            name: record.get("name"),
            conversationCount: record.get("conversationCount").low,
            lastActivityTimestamp: record.get("lastActivityTimestamp"),
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
    async propertyFilters(parent, args, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { propertyNames, where } = args;
      return resolvePropertyFilters({
        projectId,
        propertyNames,
        where,
      });
    },
    async qaSummaries(parent) {
      const { id: projectId } = parent;
      return getQaSummaries({ projectId });
    },
    async searchQas(parent, args) {
      const { id: projectId } = parent;
      const { query, sourceName, page } = args;
      if (query === "do-not-search") {
        return [];
      } else {
        return searchQas({ projectId, query, sourceName, page });
      }
    },
  },
  Conversation: {
    async completion(parent, args, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: conversationId } = parent;
      const { prompt, modelName, temperature } = args;
      return resolveCompletion({
        projectId,
        conversationId,
        prompt,
        modelName,
        temperature,
      });
    },
    async generateProperties(parent, args, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: conversationId } = parent;
      const { definitions, modelName, temperature } = args;
      return resolveGenerateProperties({
        projectId,
        conversationId,
        definitions,
        modelName,
        temperature,
      });
    },
    async generatePropertiesFromYaml(parent, args, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: conversationId } = parent;
      const { modelName, temperature, yaml } = args;
      return resolveGeneratePropertiesFromYaml({
        projectId,
        conversationId,
        yaml,
        modelName,
        temperature,
      });
    },
    async conversationJson(parent, _, { resolveTree }) {
      const projectId = resolveTree.args.where.id;
      const { id: conversationId } = parent;
      const messages = await resolveConversationJson({
        projectId,
        conversationId,
      });
      return JSON.stringify(messages);
    },
    async similarConversations(parent) {
      const { id: conversationId, project, descendants } = parent;
      if (!project || !descendants) {
        // these fields must be included in the query
        return [
          {
            id: "Please add project.id, descendants.id, and descendants.textHtml to the conversation selection.",
            distance: 2,
          },
        ];
      }
      const { id: projectId } = project;
      return getSimilarConversations({
        projectId,
        conversationId,
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
  modelName: true,
  typesenseApiKey: true,
  typesenseUrl: true,
  user: {
    select: {
      id: true,
      email: true,
    },
  },
};

const cleanupProject = (project) => {
  project.prismaUser = project.user;
  project.aiReady = aiReady(project);
  delete project.typesenseUrl;
  delete project.typesenseApiKey;
};
