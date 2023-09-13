import { Worker, Queue } from "bullmq";
import { graph } from "src/data/db";
import { connection } from "src/data/db/redis";
import { fetchActivitiesPage } from "src/integrations/orbit/api";
import { syncActivities } from "src/data/graph/mutations";

// we should only have one import per project going at any time
// concurrent imports will cause conflicting transaction failures
// so we just limit to 1 across the instance for now
const queueName = "ImportOrbitActivities";
const options = {
  connection,
  concurrency: 1,
};

export const queue = new Queue(queueName, options);

const worker = new Worker(
  queueName,
  async (job) => {
    var session;
    try {
      if (!job.data) {
        console.log("[Worker][ImportOrbitActivities] No job data!", job.id);
        return;
      }

      const { url, project } = job.data;
      const { apiKey } = project;

      session = graph.session();
      console.log(
        "[Worker][ImportOrbitActivities] Fetching activities for ",
        url
      );

      // only get one page at a time here
      const { activities, nextUrl } = await fetchActivitiesPage({
        url,
        apiKey,
      });

      await session.writeTransaction(async (tx) => {
        try {
          // this is a quick and dirty way to remove duplicate sourceId from
          // the same batch - the Orbit API has returned two activities with the same
          // source id at times
          var sourceIds = activities.map((r) => r.sourceId);
          const filteredActivities = activities.filter((record, index) => {
            return sourceIds.indexOf(record.sourceId) === index;
          });

          await syncActivities({ tx, activities: filteredActivities, project });
          console.log("Saved activities: " + filteredActivities.length);
        } catch (e) {
          console.error("[Worker][ImportActivities] Transaction failed", e);
        }
      });

      if (nextUrl) {
        await queue.add(nextUrl, {
          project,
          url: nextUrl,
        });
        console.log(
          "[Worker][ImportOrbitActivities] Enqueued Next Job for: ",
          nextUrl
        );
      } else {
        console.log(
          "[Worker][ImportOrbitActivities] No nextUrl, Import Finished",
          url
        );
      }
    } catch (e) {
      console.error("[Worker][ImportOrbitActivities] Error:", e);
    } finally {
      if (session) {
        session.close();
      }
    }
  },
  options
);

worker.on("waiting", (job) => {
  console.info(
    `[Worker][ImportOrbitActivities] Waiting: Job waiting with job ID ${job.id}`
  );
});

worker.on("active", (job) => {
  console.info(
    `[Worker][ImportOrbitActivities] Waiting: Job waiting with job ID ${job.id}`
  );
});

worker.on("added", (job) => {
  console.info(
    `[Worker][ImportOrbitActivities] Waiting: Job waiting with job ID ${job.id}`
  );
});

worker.on("completed", (job) => {
  const { project } = job.data;
  console.log(`Finished job ${job.id} for project ${project.name}`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job.name} failed with the following error:`);
  console.error(error);
});

export default worker;
