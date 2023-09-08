import Redis from "ioredis";

const { REDIS_URL } = process.env;
const client = new Redis(REDIS_URL);
const subscriber = new Redis(REDIS_URL);

// redisOpts here will contain at least a property of
// connectionName which will identify the queue based on its name
export function createClient(type, redisOpts) {
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
}
