const { Queue, Worker, QueueScheduler } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis();

const getQueueNames = async () => {
  // Fetch keys from Redis that match the BullMQ naming convention.
  const keys = await connection.keys("bull:*:id");
  return keys.map((key) => key.split(":")[1]);
};

const displayQueueInfo = async (queueName) => {
  const queue = new Queue(queueName, { connection });

  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();
  const completed = await queue.getCompletedCount();
  const failed = await queue.getFailedCount();
  const delayed = await queue.getDelayedCount();

  console.log(`Queue Name: ${queueName}`);
  console.log(`Waiting: ${waiting}`);
  console.log(`Active: ${active}`);
  console.log(`Completed: ${completed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Delayed: ${delayed}`);
  console.log("-----------------------");
};

const clearQueue = async (queueName) => {
  const queue = new Queue(queueName, { connection });

  await queue.obliterate({ force: true });

  console.log(`Cleared queue: ${queueName}`);
};

const main = async () => {
  // Replace with your list of queue names
  const queueNames = await getQueueNames();
  console.log(`Found Queues: ${queueNames.join(", ")}`);

  if (process.argv.includes("--clear")) {
    for (const q of queueNames) {
      await clearQueue(q);
    }
  } else {
    for (const q of queueNames) {
      await displayQueueInfo(q);
    }
  }
};

main()
  .catch((err) => {
    console.error("Error:", err);
  })
  .then(() => {
    process.exit(1);
  });
