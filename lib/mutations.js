import c from "lib/common";
import { prisma } from "lib/db";

export async function deleteDuplicates(project) {
  let deletedCount =
    await prisma.$executeRaw`DELETE FROM public."Activity" a USING public."Activity" b WHERE a."projectId" = '${project.id}' AND b."projectId" = a."projectId" AND a.id < b.id AND a."sourceId" = b."sourceId"`;
  console.log("Deleted " + deletedCount + " duplicate records");
  return deletedCount;
}

export function deleteActivities(project) {
  return prisma.activity.deleteMany({
    where: {
      projectId: project.id,
    },
  });
}
