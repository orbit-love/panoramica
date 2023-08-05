import { prisma, safeProjectSelectFields } from "src/data/db";
import { aiReady, orbitImportReady } from "src/integrations/ready";

export const getProject = async (id, returnAllFields = false) => {
  let where = { id, demo: true };
  // use an allowlist of fields to avoid sending back any API keys
  const project = await prisma.project.findFirst({
    where,
  });

  if (project) {
    const safeProject = {};

    if (returnAllFields) {
      for (const field in project) {
        safeProject[field] = project[field];
      }
    } else {
      for (const field in safeProjectSelectFields()) {
        safeProject[field] = project[field];
      }
    }
    safeProject.aiReady = aiReady(project);
    safeProject.orbitImportReady = orbitImportReady(project);

    return safeProject;
  }
};
