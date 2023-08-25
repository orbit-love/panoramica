export const aiReady = (project) => {
  if (project.aiReady) {
    return true;
  }
  return !!(
    project.modelName &&
    project.typesenseUrl &&
    project.typesenseApiKey
  );
};

export const orbitImportReady = (project) => {
  if (project.orbitImportReady) {
    return true;
  }
  return !!(project.url || project.workspace);
};
