import { Worker, Queue } from "bullmq";
import { graph } from "src/data/db";
import { connection } from "src/data/db/redis";
import { fetchActivitiesPage } from "src/integrations/orbit/api";
import { syncActivities } from "src/data/graph/mutations";

export const perform = async (job) => {
  try {
    if (!job.data) {
      console.log("[Worker][ImportOrbitActivities] No job data!", job.id);
      return;
    }

    const { project } = job.data;
    const { name } = project;
    const nextUrl = await fetchAndSaveActivities(job.data);
    if (nextUrl) {
      await queue.add(`ImportOrbitActivities-${project.id}`, {
        project,
        url: nextUrl,
      });
      console.log(
        "[Worker][ImportOrbitActivities] Enqueued Next Job for:",
        name
      );
    } else {
      console.log(
        "[Worker][ImportOrbitActivities] No nextUrl, Import finished for:",
        name
      );
    }
  } catch (e) {
    console.error("[Worker][ImportOrbitActivities] Error:", e);
    throw e;
  }
};

export const fetchAndSaveActivities = async ({ url, project }) => {
  var session;
  try {
    const { name, apiKey } = project;

    session = graph.session();
    console.log(
      "[Worker][ImportOrbitActivities] Fetching activities for",
      name
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
        throw e;
      }
    });

    return nextUrl;
  } catch (e) {
    console.error("[Worker][ImportOrbitActivities] Error:", e);
    throw e;
  } finally {
    if (session) {
      session.close();
    }
  }
};

// we should only have one import per project going at any time
// concurrent imports will cause conflicting transaction failures
// so we just limit to 1 across the instance for now
const queueName = "ImportOrbitActivities";
const options = {
  connection,
};

export const queue = new Queue(queueName, options);

const worker = new Worker(queueName, perform, {
  ...options,
  autorun: false,
});

export default worker;

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
