import { connection } from "src/data/db/redis";
import { NextResponse } from "next/server";
import {
  getQueueNames,
  getQueueInfo,
  clearQueue,
} from "src/workers/queues/shared";

const postHandler = async () => {
  await import("src/workers/orbit/importActivities");
  return NextResponse.json({ started: "true" });
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

export { getHandler as GET, postHandler as POST, deleteHandler as DELETE };
