import { gql } from "graphql-tag";

const typeDefs = gql`
  extend schema @mutation(operations: []) @subscription(operations: [])

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
    searchConversations(query: String!): [SearchResult!]!
      @customResolver(requires: ["id"])
  }

  type SearchResult @query(read: false, aggregate: false) {
    id: ID!
    score: Float!
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

  type Member @query(read: false, aggregate: false) {
    id: ID! @alias(property: "globalActor")
    globalActor: String!
    globalActorName: String!
  }
`;

export default typeDefs;
