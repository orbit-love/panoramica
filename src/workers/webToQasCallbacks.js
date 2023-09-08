import { crawl } from "src/data/crawler";
import { eventEmitter } from "./events";
import { prisma } from "src/data/db";
import TurndownService from "turndown";
import { deleteIndexedQAs } from "src/integrations/typesense";

export const webToQasCallbacks = {
  perform: async (job) => {
    const data = job.data;
    if (!data.startUrl || !data.projectId || !data.sourceName) {
      return "Invalid Data";
    }

    const project = await prisma.project.findFirst({
      where: { id: data.projectId },
    });

    if (!project) return "Project not found";

    const { sourceName, startUrl, rootUrl } = data;

    const results = await crawl({
      startUrl,
      rootUrl,
    });

    if (results.length === 0) return "No web page found";

    await deleteIndexedQAs({
      project,
      facets: {
        reference_url: results.map((page) => page.url),
      },
    });

    const turndownService = new TurndownService({ headingStyle: "atx" });
    results.forEach((page) => {
      eventEmitter.emit("scheduleJob", "MarkdownToQas", page.url, {
        projectId: data.projectId,
        markdown: `${page.title}\n${turndownService.turndown(
          page.body
        )}`.trim(),
        sourceName,
        type: "web",
        reference: {
          url: page.url,
          title: page.title,
        },
      });
    });

    return `Crawled ${results.length} pages`;
  },
  onCompleted: (job, returnValue) => {
    console.log(`Job ${job.name} completed and returned:`);
    console.log(returnValue);
  },
  onFailed: (job, error) => {
    console.error(`Job ${job.name} failed with the following error:`);
    console.error(error);
  },
};

export default webToQasCallbacks;
