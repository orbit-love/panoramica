const { Queue } = require("bullmq");

export const getQueueNames = async ({ connection }) => {
  // Fetch keys from Redis that match the BullMQ naming convention.
  const keys = await connection.keys("bull:*:id");
  return keys.map((key) => key.split(":")[1]);
};

export const printQueueInfo = async ({ queueName, connection }) => {
  const queueInfo = await getQueueInfo({ queueName, connection });

  const { waiting, active, completed, failed, delayed } = queueInfo;

  console.log(`Queue Name: ${queueName}`);
  console.log(`Waiting: ${waiting}`);
  console.log(`Active: ${active}`);
  console.log(`Completed: ${completed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Delayed: ${delayed}`);
  console.log("-----------------------");
};

export const getQueueInfo = async ({ queueName, connection }) => {
  const queue = new Queue(queueName, { connection });

  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();
  const completed = await queue.getCompletedCount();
  const failed = await queue.getFailedCount();
  const delayed = await queue.getDelayedCount();

  return {
    queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
};

export const clearQueue = async ({ queueName, connection }) => {
  const queue = new Queue(queueName, { connection });

  await queue.obliterate({ force: true });

  console.log(`Cleared queue: ${queueName}`);

  return true;
};
