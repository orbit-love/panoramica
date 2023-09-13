import Redis from "ioredis";

const { REDIS_URL, NODE_ENV } = process.env;

var finalRedisUrl = REDIS_URL;
if (NODE_ENV === "production") {
  // replace the redis:// with rediss://
  finalRedisUrl = REDIS_URL.replace("redis://", "rediss://");
}
export const connection = new Redis(finalRedisUrl, options);
