import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema @authentication @subscription(operations: [])

  type JWT @jwt {
    roles: [String!]!
  }

  type Query {
    prismaUser: PrismaUser
    prismaProjects: [PrismaProject]
    prismaProject(id: ID!): PrismaProject
  }

  type PrismaUser
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    id: ID!
    email: String
    admin: Boolean
  }

  type PrismaProject
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
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

  interface Bookmarked @relationshipProperties {
    createdAt: String!
    createdAtInt: Float!
  }

  type User
    @query(aggregate: false)
    @mutation(operations: [UPDATE])
    @authorization(filter: [{ where: { node: { id: "$jwt.sub" } } }]) {
    id: ID! @id
    email: String!
    projects: [Project!]! @relationship(type: "CREATED", direction: OUT)
    bookmarks: [Activity!]!
      @relationship(type: "BOOKMARKS", direction: OUT, properties: "Bookmarked")
  }

  type UserVisibleToAdmin
    @node(labels: ["User"])
    @query(aggregate: false)
    @authorization(filter: [{ where: { jwt: { roles_INCLUDES: "admin" } } }]) {
    id: ID! @id
    email: String!
    projects: [Project!]! @relationship(type: "CREATED", direction: OUT)
  }

  type Prompt {
    id: ID! @id
    context: String!
    label: String!
    prompt: String!
    project: Project! @relationship(type: "OWNS", direction: IN)
  }

  type Project
    @query(aggregate: false)
    @mutation(operations: [CREATE, UPDATE, DELETE])
    @authorization(
      filter: [
        {
          where: {
            OR: [
              { jwt: { roles_INCLUDES: "admin" } }
              { node: { creator: { id: "$jwt.sub" } } }
            ]
          }
        }
      ]
    ) {
    id: ID! @id
    name: String!
    demo: Boolean!
    activities: [Activity!]! @relationship(type: "OWNS", direction: OUT)
    members: [Member!]! @relationship(type: "OWNS", direction: OUT)
    sources: [String!]! @customResolver(requires: ["id"])
    creator: User! @relationship(type: "CREATED", direction: IN)
    prompts: [Prompt!]! @relationship(type: "OWNS", direction: OUT)
    sourceChannels(source: String!): [SourceChannel!]!
      @customResolver(requires: ["id"])
    searchConversations(query: String!): [SearchResult!]!
      @customResolver(requires: ["id"])
  }

  type SourceChannel
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    name: String!
    activityCount: Int!
    lastActivityAt: String!
  }

  type SearchResult
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    id: ID!
    score: Float!
  }

  type Activity
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    id: ID! @id
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
    similarConversations: [SearchResult!]! @customResolver(requires: ["id"])
    project: Project! @relationship(type: "OWNS", direction: IN)
    member: Member! @relationship(type: "DID", direction: IN)
    mentions: [Member!]! @relationship(type: "MENTIONS", direction: OUT)
    conversation: Activity! @relationship(type: "PART_OF", direction: OUT)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: [Activity!]! @relationship(type: "REPLIES_TO", direction: IN)
    descendants: [Activity!]! @relationship(type: "PART_OF", direction: IN)
  }

  interface Messaged @relationshipProperties {
    activities: [String!]!
    activityCount: Int!
    conversations: [String!]!
    conversationCount: Int!
    lastInteractedAt: String!
  }

  type Member @query(read: false, aggregate: false) @mutation(operations: []) {
    id: ID! @alias(property: "globalActor")
    globalActor: String!
    globalActorName: String!
    project: Project! @relationship(type: "OWNS", direction: IN)
    activities: [Activity!]! @relationship(type: "DID", direction: OUT)
    messagedWith: [Member!]!
      @relationship(
        type: "MESSAGED"
        direction: IN
        queryDirection: DEFAULT_UNDIRECTED
        properties: "Messaged"
      )
  }
`;
export default typeDefs;
