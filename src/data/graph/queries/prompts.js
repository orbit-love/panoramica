export const getPrompts = async ({ projectId, graphConnection }) => {
  const { records } = await graphConnection.run(
    `MATCH (p:Project { id: $projectId })
     RETURN p`,
    { projectId }
  );
  return records[0].get("p").properties.prompts;
};
