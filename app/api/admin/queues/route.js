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
  const token = "josh";
  var jobsProcessed = 0;
  while (true) {
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
  await worker.close();
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
