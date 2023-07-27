export const createBookmark = async ({ tx, project, activityId, user }) => {
  const projectId = project.id;
  const userId = user.id;
  const createdAt = new Date().toISOString();
  const createdAtInt = Date.parse(createdAt);

  const { records } = await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(a:Activity { id: $activityId })
      WITH a
        MERGE (a)<-[r:BOOKMARKS]-(u:User { id: $userId })
      SET r.createdAt = $createdAt, r.createdAtInt = $createdAtInt
     RETURN r`,
    { projectId, activityId, userId, createdAt, createdAtInt }
  );
  const relationshipProperties = records[0].get("r").properties;
  return { ...relationshipProperties, activityId };
};

export const deleteBookmark = async ({ tx, project, activityId, user }) => {
  const projectId = project.id;
  const userId = user.id;

  await tx.run(
    `MATCH (p:Project { id: $projectId })
      WITH p
        MATCH (p)-[:OWNS]->(a:Activity { id: $activityId })
      WITH a
        MATCH (a)<-[r:BOOKMARKS]-(u:User { id: $userId })
      DELETE r`,
    { projectId, activityId, userId }
  );
  console.log("Memgraph: Deleted bookmark");
};
