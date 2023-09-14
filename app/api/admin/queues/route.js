import { connection } from "src/data/db/redis";
import { NextResponse } from "next/server";
import {
  getQueueNames,
  getQueueInfo,
  clearQueue,
} from "src/workers/queues/shared";
import worker, { perform } from "src/workers/orbit/importActivities";

const postHandler = async () => {
  worker.run();
  return NextResponse.json({ started: "true" });
};

const putHandler = async () => {
  // https://docs.bullmq.io/patterns/manually-fetching-jobs#checking-for-stalled-jobs
  await worker.startStalledCheckTimer();

  const token = "josh-" + Math.random() + "-token";
  var jobsProcessed = 0;
  // keep a timer and don't process any more jobs if 50 seconds have gone by
  const startTime = new Date().getTime();
  // 10s of headroom
  const timeout = 60000 - 10000;
  while (true) {
    if (new Date().getTime() - startTime > timeout) {
      console.log("Nearing the timeout, stopping processing");
      break;
    }
    const job = await worker.getNextJob(token);
    if (job) {
      try {
        await perform(job);
        await job.moveToCompleted("Job complete", token, false);
        jobsProcessed++;
      } catch (e) {
        console.error("Job failed", e);
        await job.moveToFailed(e, token, false);
      }
    } else {
      break;
    }
  }
  return NextResponse.json({ started: "true", jobsProcessed });
};

const deleteHandler = async () => {
  const result = {};
  const queueNames = await getQueueNames({ connection });
  for (const queueName of queueNames) {
    result[queueName] = await clearQueue({ queueName, connection });
  }
  return NextResponse.json({ result });
};

const getHandler = async () => {
  const result = {};
  const queueNames = await getQueueNames({ connection });
  for (const queueName of queueNames) {
    result[queueName] = await getQueueInfo({ queueName, connection });
  }
  return NextResponse.json({ result });
};

export {
  getHandler as GET,
  postHandler as POST,
  deleteHandler as DELETE,
  putHandler as PUT,
};
