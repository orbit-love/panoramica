const IORedis = require("ioredis");

import { getQueueNames, displayQueueInfo } from "src/workers/queues/shared";

const main = async () => {
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
