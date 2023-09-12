const { Queue } = require("bullmq");
const IORedis = require("ioredis");

export const getQueueNames = async ({ connection }) => {
  // Fetch keys from Redis that match the BullMQ naming convention.
  const keys = await connection.keys("bull:*:id");
  return keys.map((key) => key.split(":")[1]);
};

export const displayQueueInfo = async ({ queueName, connection }) => {
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

  return {
    queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
};

const clearQueue = async ({ queueName, connection }) => {
  const queue = new Queue(queueName, { connection });

  await queue.obliterate({ force: true });

  console.log(`Cleared queue: ${queueName}`);
};

const main = async () => {
  // Replace with your list of queue names
  const queueNames = await getQueueNames();
  console.log(`Found Queues: ${queueNames.join(", ")}`);

  const connection = new IORedis(process.env.REDIS_URL);

  if (process.argv.includes("--clear")) {
    for (const queueName of queueNames) {
      await clearQueue({ queueName, connection });
    }
  } else {
    for (const queueName of queueNames) {
      await displayQueueInfo({ queueName, connection });
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
