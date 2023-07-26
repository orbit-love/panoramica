export const aiReady = (project) => {
  return project.modelApiKey && project.pineconeApiKey;
};

export const orbitImportReady = (project) => {
  return (project.url || project.workspace) && project.apiKey;
};
