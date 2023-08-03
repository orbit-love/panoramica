export const updatePrompts = async ({ project, prompts, tx }) => {
  const projectId = project.id;
  const { records } = await tx.run(
    `MATCH (p:Project { id: $projectId })
     WITH p
     SET p.prompts = $prompts
     RETURN p`,
    { projectId, prompts }
  );
  return records[0].get("p").properties.prompts;
};
