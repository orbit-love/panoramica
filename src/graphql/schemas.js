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
    description: String
    demo: Boolean
    url: String
    modelName: String
    workspace: String
    typesenseUrl: String
    typesenseApiKey: String
    aiReady: Boolean
    prismaUser: PrismaUser!
  }

  interface Bookmarked @relationshipProperties {
    createdAt: String!
    createdAtInt: Float!
  }

  interface Pinned @relationshipProperties {
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

  type PropertyFilterOption {
    value: String!
    count: Int!
  }

  type PropertyFilter {
    name: String!
    values: [PropertyFilterOption!]!
  }

  input PropertyFilterInput {
    source: String
    sourceChannel: String
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
    pins: [Activity!]!
      @relationship(type: "PINS", direction: OUT, properties: "Pinned")
    members: [Member!]! @relationship(type: "OWNS", direction: OUT)
    sources: [String!]! @customResolver(requires: ["id"])
    creator: User! @relationship(type: "CREATED", direction: IN)
    prompts: [Prompt!]! @relationship(type: "OWNS", direction: OUT)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    propertyFilters(
      propertyNames: [String]
      where: PropertyFilterInput
    ): [PropertyFilter!]! @customResolver(requires: ["id"])
    sourceChannels(source: String!): [SourceChannel!]!
      @customResolver(requires: ["id"])
    searchConversations(query: String!): [SearchResult!]!
      @customResolver(requires: ["id"])
    qaSummaries: [QaSummary!]! @customResolver(requires: ["id"])
    searchQas(query: String, sourceName: String, page: Int): QaSearchResult!
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
    distance: Float!
  }

  type QaSearchResult {
    qaSummaries: [QaSummary!]!
    qas: [Qa!]!
  }

  type Qa {
    id: String!
    question: String!
    answer: String!
    sourceName: String!
    distance: Float!
    referenceUrl: String
    referenceId: String
    referenceTitle: String
    type: String
    timestamp: Int
  }

  type QaSummary {
    sourceName: String!
    count: Int!
  }

  type Property {
    name: String!
    type: String!
    value: String!
    confidence: Float
  }

  input GeneratePropertyInput {
    name: String!
    type: String!
    description: String!
  }

  type Activity
    @query(read: false, aggregate: false)
    @mutation(operations: [UPDATE]) {
    id: ID! @id
    conversationId: String
    isConversation: Boolean
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
    timestampInt: Float
    url: String
    project: Project! @relationship(type: "OWNS", direction: IN)
    member: Member! @relationship(type: "DID", direction: IN)
    mentions: [Member!]! @relationship(type: "MENTIONS", direction: OUT)
    conversation: Activity! @relationship(type: "PART_OF", direction: OUT)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: [Activity!]! @relationship(type: "REPLIES_TO", direction: IN)
    descendants: [Activity!]! @relationship(type: "PART_OF", direction: IN)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    completion(prompt: String!, modelName: String, temperature: Float): String!
      @customResolver(requires: ["id"])
    generateProperties(
      definitions: [GeneratePropertyInput!]!
      modelName: String
      temperature: Float
    ): [Property!]! @customResolver(requires: ["id"])
    generatePropertiesFromYaml(
      yaml: String
      modelName: String
      temperature: Float
    ): [Property!]! @customResolver(requires: ["id"])
    conversationJson: String! @customResolver(requires: ["id"])
    similarConversations: [SearchResult!]! @customResolver(requires: ["id"])
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
    activityCount: Int!
    conversationCount: Int!
    messagedWithCount: Int!
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
