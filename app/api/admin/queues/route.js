import IORedis from "ioredis";
import { NextResponse } from "next/server";
import {
  getQueueNames,
  displayQueueInfo,
  clearQueue,
} from "src/workers/queues/shared";

const postHandler = async () => {
  await import("src/workers/orbit/importActivities");
  return NextResponse.json({ started: "true" });
};

const deleteHandler = async () => {
  const connection = new IORedis(process.env.REDIS_URL);
  const result = {};
  const queueNames = await getQueueNames({ connection });
  for (const queueName of queueNames) {
    result[queueName] = await clearQueue({ queueName, connection });
  }
  return NextResponse.json({ result });
};

const getHandler = async () => {
  const connection = new IORedis(process.env.REDIS_URL);
  const result = {};
  const queueNames = await getQueueNames({ connection });
  for (const queueName of queueNames) {
    result[queueName] = await displayQueueInfo({ queueName, connection });
  }
  return NextResponse.json({ result });
};

export { getHandler as GET, postHandler as POST, deleteHandler as DELETE };
