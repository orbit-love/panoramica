import { gql } from "graphql-tag";

const typeDefs = gql`
  type Query {
    prismaUser: PrismaUser
    prismaProjects: [PrismaProject]
    prismaProject(id: ID!): PrismaProject
  }

  type PrismaUser {
    id: ID!
    email: String
    admin: Boolean
  }

  type PrismaProject {
    id: ID!
    name: String!
    demo: Boolean
    url: String
    modelName: String
    workspace: String
    pineconeApiEnv: String
    pineconeIndexName: String
    prismaUser: PrismaUser!
  }

  type Project {
    id: ID!
    activities: [Activity!]! @relationship(type: "OWNS", direction: OUT)
    members: [Member!]! @relationship(type: "OWNS", direction: OUT)
    sources: [String!]! @customResolver(requires: ["id"])
    sourceChannels(source: String!): [SourceChannel!]!
      @customResolver(requires: ["id"])
  }

  type SourceChannel {
    name: String!
    activityCount: Int!
    lastActivityAt: String!
  }

  type SimilarConversation {
    id: ID!
    score: Float!
  }

  type Activity {
    id: ID!
    actor: String
    actorName: String
    globalActor: String
    globalActorName: String
    source: String
    sourceId: String
    sourceParentId: String
    sourceChannel: String
    sourceType: String
    text: String
    textHtml: String
    timestamp: String
    timestampInt: Int
    url: String
    summary: String
    similarConversations: [SimilarConversation!]!
      @customResolver(requires: ["id"])
    project: Project! @relationship(type: "OWNS", direction: IN)
    member: Member! @relationship(type: "DID", direction: IN)
    mentions: [Member!]! @relationship(type: "MENTIONS", direction: OUT)
    conversation: Activity! @relationship(type: "PART_OF", direction: OUT)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: [Activity!]! @relationship(type: "REPLIES_TO", direction: IN)
    descendants: [Activity!]! @relationship(type: "PART_OF", direction: IN)
  }

  type Member {
    id: ID! @alias(property: "globalActor")
    globalActor: String!
    globalActorName: String!
    project: Project! @relationship(type: "OWNS", direction: IN)
    activities: [Activity!]! @relationship(type: "DID", direction: OUT)
  }
`;
export default typeDefs;
