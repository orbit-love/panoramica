import Redis from "ioredis";
import { Queue, Worker } from "bullmq";
import processPagesCallbacks from "src/workers/processPagesCallbacks";
import crawlPagesCallbacks from "src/workers/crawlPagesCallbacks";
import { eventEmitter } from "./events";

const { REDIS_URL } = process.env;
const client = new Redis(REDIS_URL);
const subscriber = new Redis(REDIS_URL);

const opts = {
  // redisOpts here will contain at least a property of
  // connectionName which will identify the queue based on its name
  createClient: function (type, redisOpts) {
    switch (type) {
      case "client":
        return client;
      case "subscriber":
        return subscriber;
      case "bclient":
        return new Redis(REDIS_URL, redisOpts);
      default:
        throw new Error("Unexpected connection type: ", type);
    }
  },
};

function startWorker(queueName, callbacks) {
  const queue = new Queue(queueName, opts);
  const worker = new Worker(
    queue.name,
    async (job) => {
      callbacks.perform(job);
    },
    { connection }
  );

  worker.on("completed", callbacks.onCompleted);
  worker.on("failed", callbacks.onFailed);

  return {
    queue,
    worker,
  };
}

export const WORKER_DEFINITIONS = {
  crawlPages: startWorker("CrawlPages", crawlPagesCallbacks),
  processPages: startWorker("ProcessPages", processPagesCallbacks),
};

export const scheduleJob = (queueName, jobId, data) => {
  const workerDefinition = WORKER_DEFINITIONS[queueName];
  if (!workerDefinition) {
    throw Error(`No worker definition found for Queue ${queue}`);
  }
  workerDefinition.queue.add(jobId, data);
};

eventEmitter.on("scheduleJob", (queueName, jobId, data) => {
  scheduleJob(queueName, jobId, data);
});
