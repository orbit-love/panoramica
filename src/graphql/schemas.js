import { gql } from "graphql-tag";

const typeDefs = gql`
  type Query {
    user: User
    projects: [Project]
    project(id: ID!): Project
  }

  type User {
    id: ID
    email: String
    admin: Boolean
    projects: [Project!]!
  }

  scalar Cursor

  type PageInfo {
    hasNextPage: Boolean!
  }

  type Project {
    id: ID
    demo: Boolean
    name: String
    membersConnection(first: Int!, after: Cursor): MembersConnection!
    activitiesConnection(first: Int!, after: Cursor): ActivitiesConnection!
    user: User!
    searchMember(value: String): [Member]
  }

  type Activity {
    id: ID
    actor: String!
    actorName: String
    globalActor: String
    globalActorName: String
    timestamp: String!
    timestampInt: Int!
    url: String
    source: String!
    sourceId: String!
    sourceChannel: String
    sourceType: String
    text: String
    member: Member!
  }

  type ActivityEdge {
    cursor: Cursor!
    node: Activity!
  }

  type ActivitiesConnection {
    edges: [ActivityEdge!]!
    pageInfo: PageInfo!
  }

  type Member {
    id: ID
    globalActor: String
    activitiesConnection(first: Int!, after: Cursor): ActivitiesConnection!
  }

  type MemberEdge {
    cursor: Cursor!
    node: Member!
  }

  type MembersConnection {
    edges: [MemberEdge!]!
    pageInfo: PageInfo!
  }
`;
export default typeDefs;
