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
