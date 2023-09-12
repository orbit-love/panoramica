import Redis from "ioredis";

const { REDIS_URL, NODE_ENV } = process.env;
const options = NODE_ENV === "production" ? { tls: {} } : {};
export const connection = new Redis(REDIS_URL, options);
