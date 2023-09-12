import { OGM } from "@neo4j/graphql-ogm";
import { gql } from "graphql-tag";
import typeDefs from "src/graphql/schemas";
import resolvers from "src/graphql/resolvers";
import { graph } from "src/data/db";

// for some reason the requires: ["id"] makes the OGM throw
// an error, so we remove it before creating the typeDefs
const typeDefsString = typeDefs.loc.source.body;
const modifiedTypeDefsString = typeDefsString.replace(
  /\(requires: \["id"\]\)/g,
  ""
);
const typeDefsWithoutRequires = gql`
  ${modifiedTypeDefsString}
`;

const key = process.env.NEXTAUTH_SECRET;
export const ogm = new OGM({
  typeDefs: typeDefsWithoutRequires,
  resolvers,
  driver: graph,
  features: {
    authorization: {
      key,
    },
  },
  config: {
    driverConfig: {
      database: "memgraph",
    },
  },
});

export const Activity = ogm.model("Activity");
export const Conversation = ogm.model("Conversation");
export const Project = ogm.model("Project");
