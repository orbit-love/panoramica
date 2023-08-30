import { prisma } from "src/data/db";
import { getProjectQAsCollection } from "src/integrations/typesense";

export const getQaSummaries = async ({ projectId }) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });
  if (!project) return [];
  const collection = await getProjectQAsCollection({ project });
  if (!collection) return [];

  const results = await collection.$.documents().search({
    q: "",
    facet_by: ["root_url"],
  });

  console.log("Typesense facet results", results);

  return [];
};
