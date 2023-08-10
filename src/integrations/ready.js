export const aiReady = (project) => {
  if (project.aiReady) {
    return true;
  }
  return !!(
    project.modelName &&
    project.pineconeApiEnv &&
    project.pineconeIndexName
  );
};

export const orbitImportReady = (project) => {
  if (project.orbitImportReady) {
    return true;
  }
  return !!(project.url || project.workspace);
};
