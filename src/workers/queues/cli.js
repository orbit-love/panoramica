const Redis = require("ioredis");

import { getQueueNames, displayQueueInfo } from "./shared";

const main = async () => {
  const { REDIS_URL, NODE_ENV } = process.env;
  const options = NODE_ENV === "production" ? { tls: {} } : {};
  const connection = new Redis(REDIS_URL, options);

  const queueNames = await getQueueNames({ connection });
  console.log(`Found Queues: ${queueNames.join(", ")}`);

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
