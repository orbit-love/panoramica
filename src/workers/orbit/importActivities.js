import { Worker, Queue } from "bullmq";
import { graph } from "src/data/db";
import { connection } from "src/data/db/redis";
import { fetchActivitiesPage } from "src/integrations/orbit/api";
import { syncActivities } from "src/data/graph/mutations";

const queueName = "ImportOrbitActivities";
const options = {
  connection,
};

export const queue = new Queue(queueName, options);

const worker = new Worker(
  queueName,
  async (job) => {
    const { url, project } = job.data;
    const { apiKey } = project;
    const session = graph.session();

    try {
      console.log(`[Worker][orbit/ImportActivities] Fetching activities...`);

      // only get one page at a time here
      const { activities, nextUrl } = await fetchActivitiesPage({
        url,
        apiKey,
      });

      await session.writeTransaction(async (tx) => {
        // this is a quick and dirty way to remove duplicate sourceId from
        // the same batch - the Orbit API has returned two activities with the same
        // source id at times
        var sourceIds = activities.map((r) => r.sourceId);
        const filteredActivities = activities.filter((record, index) => {
          return sourceIds.indexOf(record.sourceId) === index;
        });

        await syncActivities({ tx, activities: filteredActivities, project });
        console.log("Saved activities: " + filteredActivities.length);
      });

      if (nextUrl) {
        queue.add(nextUrl, {
          project,
          url: nextUrl,
        });
      }
    } catch (e) {
      console.log("[Worker][ImportOrbitActivities] Error:", e);
    } finally {
      session.close();
    }
  },
  options
);

worker.on("completed", (job) => {
  const { project } = job.data;
  console.log(`Finished job ${job.id} for project ${project.name}`);
});

export default worker;
