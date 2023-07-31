export const getActivity = async function ({
  projectId,
  activityId,
  graphConnection,
}) {
  // return results in ascending order by reply timestamp
  const query = `
    MATCH (p:Project { id: $projectId })
    WITH p
      MATCH (p)-[:OWNS]-(a:Activity { id: $activityId })
    RETURN a`;

  const { records } = await graphConnection.run(query, {
    projectId,
    activityId,
  });

  return records.map((record) => record.get("a").properties)[0];
};

export const getActivities = async function ({
  projectId,
  conversationId,
  graphConnection,
}) {
  // return results in ascending order by reply timestamp
  const query = `
    MATCH (p:Project { id: $projectId })
    WITH p
      MATCH (p)-[:OWNS]-(a:Activity { conversationId: $conversationId })<-[:REPLIES_TO*0..]-(b:Activity)
    WITH DISTINCT b
      ORDER BY b.timestamp
    RETURN b`;

  const { records } = await graphConnection.run(query, {
    projectId,
    conversationId,
  });

  return records.map((record) => record.get("b").properties);
};