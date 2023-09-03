import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema @mutation(operations: []) @subscription(operations: [])

  interface Pinned @relationshipProperties {
    createdAt: String!
    createdAtInt: Float!
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
    pins: [Activity!]!
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

  type Property {
    name: String!
    type: String!
    value: String!
    confidence: Float
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
    conversation: Activity! @relationship(type: "PART_OF", direction: OUT)
    parent: Activity @relationship(type: "REPLIES_TO", direction: OUT)
    replies: [Activity!]! @relationship(type: "REPLIES_TO", direction: IN)
    descendants: [Activity!]! @relationship(type: "PART_OF", direction: IN)
    properties: [Property!]! @relationship(type: "HAS", direction: OUT)
    similarConversations: [SearchResult!]! @customResolver(requires: ["id"])
  }

  type Member @query(read: false, aggregate: false) {
    id: ID! @alias(property: "globalActor")
    globalActor: String!
    globalActorName: String!
  }
`;

export default typeDefs;
