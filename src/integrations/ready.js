export const aiReady = (project) => {
  if (project.aiReady) {
    return true;
  }
  return !!(project.modelApiKey && project.pineconeApiKey);
};

export const orbitImportReady = (project) => {
  if (project.orbitImportReady) {
    return true;
  }
  return !!((project.url || project.workspace) && project.apiKey);
};
