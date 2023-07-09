import { PrismaClient } from "@prisma/client";
import neo4j from "neo4j-driver";

const newGraphDriver = () => {
  var uri = process.env.MEMGRAPH_URI;
  var username = process.env.MEMGRAPH_USERNAME;
  var password = process.env.MEMGRAPH_PASSWORD;
  return neo4j.driver(uri, neo4j.auth.basic(username, password));
};

const globalForDatabases = globalThis;

export const prisma = globalForDatabases.prisma ?? new PrismaClient();
export const graph = globalForDatabases.graph || newGraphDriver();

if (process.env.NODE_ENV !== "production") {
  globalForDatabases.prisma = prisma;
  globalForDatabases.graph = graph;
}

export const safeProjectSelectFields = () => {
  return {
    id: true,
    name: true,
    workspace: true,
    url: true,
    modelName: true,
    pineconeApiEnv: true,
    pineconeIndexName: true,
  };
};
