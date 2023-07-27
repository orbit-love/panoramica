import { toProperties } from "./index";

export const getBookmarks = async ({ projectId, userId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
       WITH p
     MATCH (p)-[:OWNS]->(a:Activity)<-[b:BOOKMARKS]-(u:User { id: $userId })
       RETURN b, a`,
    { projectId, userId }
  );
  return toProperties(records, (record) => ({
    activityId: record.get("a").properties.id,
  }));
};
