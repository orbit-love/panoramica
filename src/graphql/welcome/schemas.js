import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema @mutation(operations: []) @subscription(operations: [])

  interface Pinned @relationshipProperties {
    createdAt: String!
    createdAtInt: Float!
  }

  type PropertyFilterOption @query(read: false, aggregate: false) {
    value: String!
    count: Int!
  }

  type PropertyFilter @query(read: false, aggregate: false) {
    name: String!
    values: [PropertyFilterOption!]!
  }

  input PropertyFilterInput {
    source: String
    sourceChannel: String
  }

  type Project
    @query(aggregate: false)
    @authorization(
      filter: [
        {
          requireAuthentication: false
          operations: [READ]
          where: { node: { demo: true } }
        }
      ]
    ) {
    id: ID!
    name: String!
    demo: Boolean!
    activities: [Activity!]! @relationship(type: "OWNS", direction: OUT)
    conversations: [Conversation!]! @relationship(type: "OWNS", direction: OUT)
    pins: [Conversation!]!
      @relationship(type: "PINS", direction: OUT, properties: "Pinned")
    prompts: [Prompt!]! @relationship(type: "OWNS", direction: OUT)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    propertyFilters(
      propertyNames: [String]
      where: PropertyFilterInput
    ): [PropertyFilter!]! @customResolver(requires: ["id"])
    searchConversations(query: String!): [SearchResult!]!
      @customResolver(requires: ["id"])
  }

  type Prompt
    @query(read: false, aggregate: false)
    @authorization(
      filter: [
        {
          requireAuthentication: false
          operations: [READ]
          where: { node: { context: "Public" } }
        }
      ]
    ) {
    id: ID! @id
    context: String!
    label: String!
    prompt: String!
  }

  type SearchResult @query(read: false, aggregate: false) {
    id: ID!
    distance: Float!
  }

  type Property @query(read: false, aggregate: false) {
    name: String!
    type: String!
    value: String!
    confidence: Float
  }

  type Conversation @query(read: false, aggregate: false) {
    id: ID! @id
    firstActivityTimestamp: String!
    lastActivityTimestamp: String!
    memberCount: Int!
    activityCount: Int!
    missingParent: String
    source: String!
    sourceChannel: String!
    project: Project! @relationship(type: "OWNS", direction: IN)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    beginsWith: [Activity!]! @relationship(type: "BEGINS", direction: IN)
    descendants: [Activity!]! @relationship(type: "INCLUDES", direction: OUT)
    members: [Member!]! @relationship(type: "INCLUDES", direction: OUT)
    similarConversations: [SearchResult!]! @customResolver(requires: ["id"])
  }

  type Activity @query(read: false, aggregate: false) {
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
    project: Project! @relationship(type: "OWNS", direction: IN)
    member: Member! @relationship(type: "DID", direction: IN)
    mentions: [Member!]! @relationship(type: "MENTIONS", direction: OUT)
    conversation: Conversation! @relationship(type: "INCLUDES", direction: IN)
    begins: [Conversation!]! @relationship(type: "BEGINS", direction: OUT)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: [Activity!]! @relationship(type: "REPLIES_TO", direction: IN)
  }

  type Member @query(read: false, aggregate: false) {
    id: ID!
    globalActor: String!
    globalActorName: String!
  }
`;

export default typeDefs;
