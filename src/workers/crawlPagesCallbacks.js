import { crawl } from "src/data/crawler";
import { eventEmitter } from "./events";
import { deleteIndexedQAs } from "src/integrations/typesense";
import { prisma } from "src/data/db";

export default {
  perform: async (job) => {
    const data = job.data;
    if (!data.startUrl || !data.rootUrl || !data.projectId) {
      return;
    }

    const project = await prisma.project.findFirst({
      where: { id: data.projectId },
    });

    if (!project) return "Project not found";
    const results = await crawl(data.startUrl, data.rootUrl);

    await deleteIndexedQAs({ project, rootUrl });

    results.forEach((page) => {
      eventEmitter.emit("scheduleJob", "ProcessPages", page.url, {
        projectId: data.projectId,
        page: page,
      });
    });

    return `Crawled ${results.length} pages`;
  },
  onComplete: (job, returnValue) => {
    console.log(`Job ${job} completed and returned:`);
    console.log(returnValue);
  },
  onFailed: (job, error) => {
    console.error(`Job ${job} failed with the following error:`);
    console.error(error);
  },
};
