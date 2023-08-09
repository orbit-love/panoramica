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

  type Activity {
    id: ID!
    text: String
    timestamp: String!
    timestampInt: Int!
    source: String!
    sourceChannel: String!
    member: Member! @relationship(type: "DID", direction: IN)
    mentions: [Member!]! @relationship(type: "MENTIONS", direction: OUT)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: Activity @relationship(type: "REPLIES_TO", direction: IN)
  }

  type Member {
    id: ID! @alias(property: "globalActor")
    globalActor: String!
    globalActorName: String!
    activities: [Activity!]! @relationship(type: "DID", direction: OUT)
  }
`;
export default typeDefs;
