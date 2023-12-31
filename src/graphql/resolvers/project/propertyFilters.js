import GraphConnection from "src/data/graph/Connection";

const resolvePropertyFilters = async ({
  projectId,
  propertyNames,
  where = {},
}) => {
  const graphConnection = new GraphConnection();

  const wheres = [];
  const { source, sourceChannel } = where;

  if (source) {
    wheres.push(`c.source = $source`);
  }
  if (sourceChannel) {
    wheres.push(`c.sourceChannel = $sourceChannel`);
  }
  if (propertyNames) {
    wheres.push(`prop.name IN $propertyNames`);
  }
  var whereClause = wheres.length > 0 ? `WHERE ${wheres.join(" AND ")}` : "";

  const { records } = await graphConnection.run(
    // match the project, all activities in the project,
    // and all properties of those activities, and then
    // return each property along with a count of how many
    // activities have that property
    `MATCH (p:Project { id: $projectId })
        WITH p
      MATCH (p)-[:OWNS]->(c:Conversation)-[:HAS]->(prop:Property)
        ${whereClause}
      WITH prop.name AS propertyName, prop.value AS propertyValue
      WITH propertyName, propertyValue, COUNT(*) AS count ORDER by propertyName, count DESC
      WITH propertyName, COLLECT({value: propertyValue, count: count}) AS valueData
      RETURN propertyName, valueData
      ORDER BY propertyName`,
    {
      projectId,
      propertyNames,
      ...where,
    }
  );

  // filter out any records without a property name, indicating that
  // no properties were matched given the filters
  return records
    .filter((record) => record.get("propertyName"))
    .map((record) => ({
      name: record.get("propertyName"),
      values: record.get("valueData").map((item) => ({
        value: item.value,
        count: item.count.low,
      })),
    }));
};

export default resolvePropertyFilters;
