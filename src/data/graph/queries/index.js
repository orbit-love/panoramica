// get all the activities within the timeframe
export const getActivities = async ({
  projectId,
  graphConnection,
  from,
  to,
}) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
    WITH p
    MATCH (p)-[:OWNS]->(a:Activity)
       ${
         from && to ? ` WHERE a.timestamp >= $from AND a.timestamp <= $to ` : ``
       }
    RETURN a ORDER BY a.timestamp DESC`,
    { projectId, from, to }
  );
  return toProperties(records);
};

export const toProperties = (records, extra = () => {}) => {
  // filter out the weird empty single record when a query returns nothing
  return records
    .filter((record) => record.get(0)?.properties)
    .map((record) => ({
      ...record.get(0).properties,
      ...extra(record),
    }));
};
