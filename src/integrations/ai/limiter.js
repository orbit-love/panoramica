import { encoding_for_model } from "tiktoken";

// 90_000 TPM + 3500 RPM for most cases (gpt 4)
// 180_000 TPM + 3500 RPM for most cases (gpt 3.5 turbo)

// Putting the limits on the safer side
// Warning: This doesn't account for multiple projects sharing the same account
const TOKENS_LIMIT = 89900;
// 100 should be good enough
const REQUESTS_LIMIT = 100;

// Per minute because Open AI has minutely limiters
// Also it's okay to keep it in server memory because we only care about the current minute
// ...And each deploy take around that time anyway
const TOKEN_COUNTERS = {};
const REQUEST_COUNTERS = {};

const getTokenCounter = ({ counterId }) => {
  TOKEN_COUNTERS[counterId] ||= {};
  return TOKEN_COUNTERS[counterId];
};

const getRequestCounter = ({ counterId }) => {
  REQUEST_COUNTERS[counterId] ||= {};
  return REQUEST_COUNTERS[counterId];
};

// We need to cleanup the counters to not account for the previous hour
const cleanupCounter = (counter, currentBucketIndex) => {
  for (const bucketIndex in counter) {
    if (bucketIndex != currentBucketIndex) {
      // Should be safe since we're using a single thread
      delete counter[bucketIndex];
    }
  }
};

export const checkAILimits = ({
  counterId,
  counterName,
  modelName,
  prompt,
}) => {
  const bucketIndex = new Date().getMinutes();

  const requestCounter = getRequestCounter({ counterId });
  requestCounter[bucketIndex] = 1 + (requestCounter[bucketIndex] || 0);
  cleanupCounter(requestCounter, bucketIndex);
  if (requestCounter[bucketIndex] > REQUESTS_LIMIT) {
    console.log(`Request Rate Limit hit for Project ${counterName}`);
    return false;
  }

  // if the model is not valid tiktoken will throw an error, default to gpt 3.5
  let encoding;
  try {
    encoding = encoding_for_model(modelName);
  } catch {
    encoding = encoding_for_model("gpt-3.5-turbo");
  }

  const tokenCount = encoding.encode(prompt).length;
  const tokenCounter = getTokenCounter({ counterId });
  tokenCounter[bucketIndex] = tokenCount + (tokenCounter[bucketIndex] ||= 0);
  cleanupCounter(tokenCounter, bucketIndex);
  if (tokenCounter[bucketIndex] > TOKENS_LIMIT) {
    console.log(`Tokens Rate Limit hit for Project ${counterName}`);
    return false;
  }

  return true;
};
