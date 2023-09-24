import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema @authentication

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
    createdAtInt: BigInt!
  }

  interface Pinned @relationshipProperties {
    createdAt: String!
    createdAtInt: BigInt!
  }

  type User
    @query(aggregate: false)
    @mutation(operations: [UPDATE])
    @authorization(filter: [{ where: { node: { id: "$jwt.sub" } } }]) {
    id: ID! @id
    email: String!
    projects: [Project!]! @relationship(type: "CREATED", direction: OUT)
    bookmarks: [Conversation!]!
      @relationship(type: "BOOKMARKS", direction: OUT, properties: "Bookmarked")
  }

  type UserVisibleToAdmin
    @node(labels: ["User"])
    @query(aggregate: false)
    @mutation(operations: [])
    @authorization(filter: [{ where: { jwt: { roles_INCLUDES: "admin" } } }]) {
    id: ID! @id
    email: String!
    projects: [Project!]! @relationship(type: "CREATED", direction: OUT)
  }

  type Prompt @query(read: false, aggregate: false) @mutation(operations: []) {
    id: ID! @id
    context: String!
    label: String!
    prompt: String!
    project: Project! @relationship(type: "OWNS", direction: IN)
  }

  type PropertyFilterOption
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    value: String!
    count: Int!
  }

  type PropertyFilter
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
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
    conversations: [Conversation!]! @relationship(type: "OWNS", direction: OUT)
    pins: [Conversation!]!
      @relationship(type: "PINS", direction: OUT, properties: "Pinned")
    members: [Member!]! @relationship(type: "OWNS", direction: OUT)
    creator: User! @relationship(type: "CREATED", direction: IN)
    prompts: [Prompt!]! @relationship(type: "OWNS", direction: OUT)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    propertyFilters(
      propertyNames: [String]
      where: PropertyFilterInput
    ): [PropertyFilter!]! @customResolver(requires: ["id"])
    sources: [Source!]! @customResolver(requires: ["id"])
    sourceChannels(source: String!): [SourceChannel!]!
      @customResolver(requires: ["id"])
    searchConversations(query: String!): [SearchResult!]!
      @customResolver(requires: ["id"])
    qaSummaries: [QaSummary!]! @customResolver(requires: ["id"])
    searchQas(query: String, sourceName: String, page: Int): QaSearchResult!
      @customResolver(requires: ["id"])
  }

  type Source @query(read: false, aggregate: false) @mutation(operations: []) {
    name: String!
    conversationCount: Int!
    lastActivityTimestamp: String!
  }

  type SourceChannel
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    name: String!
    conversationCount: Int!
    lastActivityTimestamp: String!
  }

  type SearchResult
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    id: ID!
    distance: Float!
  }

  type QaSearchResult
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    qaSummaries: [QaSummary!]!
    qas: [Qa!]!
  }

  type Qa @query(read: false, aggregate: false) @mutation(operations: []) {
    id: String!
    question: String!
    answer: String!
    sourceName: String!
    distance: Float!
    referenceUrl: String
    referenceId: String
    referenceTitle: String
    type: String
    timestamp: BigInt
  }

  type QaSummary
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    sourceName: String!
    count: Int!
  }

  type Property
    @query(read: false, aggregate: false)
    @mutation(operations: []) {
    name: String!
    type: String!
    value: String!
  }

  input GeneratePropertyInput {
    name: String!
    type: String!
    description: String!
  }

  # some fields are not marked required due to an issue with connectOrCreate
  type Conversation
    @query(read: false, aggregate: false)
    @mutation(operations: [UPDATE]) {
    id: ID! @id
    firstActivityTimestamp: String
    lastActivityTimestamp: String
    firstActivityTimestampInt: BigInt
    lastActivityTimestampInt: BigInt
    memberCount: Int
    activityCount: Int
    missingParent: String
    source: String!
    sourceChannel: String
    memberIds: [ID!]!
    activityIds: [ID!]!
    project: Project! @relationship(type: "OWNS", direction: IN)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    startsWith: [Activity!]! @relationship(type: "STARTS_WITH", direction: OUT)
    descendants: [Activity!]! @relationship(type: "INCLUDES", direction: OUT)
    members: [Member!]! @relationship(type: "INCLUDES", direction: OUT)

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

  # some fields are not marked required due to an issue with connectOrCreate
  type Activity
    @query(read: false, aggregate: false)
    @mutation(operations: [UPDATE]) {
    id: ID! @id
    actor: String
    actorName: String
    globalActor: String
    globalActorName: String
    globalActorAvatar: String
    source: String
    sourceId: String
    sourceParentId: String
    sourceChannel: String
    sourceType: String
    text: String
    textHtml: String
    timestamp: String
    timestampInt: BigInt
    url: String
    project: Project! @relationship(type: "OWNS", direction: IN)
    member: Member! @relationship(type: "DID", direction: IN)
    mentions: [Member!]! @relationship(type: "MENTIONS", direction: OUT)
    conversation: Conversation! @relationship(type: "INCLUDES", direction: IN)
    starts: [Conversation!]! @relationship(type: "STARTS_WITH", direction: IN)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: [Activity!]! @relationship(type: "REPLIES_TO", direction: IN)
  }

  interface Messaged @relationshipProperties {
    activities: [String!]!
    activityCount: Int!
    conversationIds: [String!]!
    conversationCount: Int!
    lastInteractedAt: String!
  }

  type Member @query(read: false, aggregate: false) @mutation(operations: []) {
    id: ID!
    globalActor: String!
    globalActorName: String!
    globalActorAvatar: String
    activityCount: Int!
    conversationCount: Int!
    messagedWithCount: Int!
    project: Project! @relationship(type: "OWNS", direction: IN)
    activities: [Activity!]! @relationship(type: "DID", direction: OUT)
    conversations: [Conversation!]!
      @relationship(type: "INCLUDES", direction: IN)
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
