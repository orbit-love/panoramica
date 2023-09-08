import Redis from "ioredis";
import { Queue, Worker } from "bullmq";
import { eventEmitter } from "./events";
import markdownToQasCallbacks from "./markdownToQasCallbacks";
import webToQasCallbacks from "./webToQasCallbacks";
import conversationsToQasCallbacks from "./conversationsToQasCallbacks";

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
    callbacks.limiter ? { limiter: callbacks.limiter } : {}
  );

  worker.on("completed", callbacks.onCompleted);
  worker.on("failed", callbacks.onFailed);

  return {
    queue,
    worker,
  };
}

export const WORKER_DEFINITIONS = {
  WebToQas: startWorker("WebToQas", webToQasCallbacks),
  MarkdownToQas: startWorker("MarkdownToQas", markdownToQasCallbacks),
  ConversationsToQas: startWorker(
    "ConversationsToQas",
    conversationsToQasCallbacks
  ),
};

export const scheduleJob = (queueName, jobId, data) => {
  console.log(`[Worker] ScheduleJob called on queue ${queueName}`);
  const workerDefinition = WORKER_DEFINITIONS[queueName];
  if (!workerDefinition) {
    throw Error(`No worker definition found for Queue ${queueName}`);
  }
  if (process.env.DEBUG) {
    console.log(
      `[Worker] Queueing job jobId=${jobId}, queue=${queueName}, data=\n`,
      JSON.stringify(data, null, 2)
    );
  } else {
    console.log(`[Worker] Queueing job jobId=${jobId}, queue=${queueName}`);
  }
  workerDefinition.queue.add(jobId, data);
};

eventEmitter.on("scheduleJob", (queueName, jobId, data) => {
  scheduleJob(queueName, jobId, data);
});
