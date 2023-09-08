import { generate, expandArrayProperties } from "./index";

const resolveGenerateProperties = async ({
  projectId,
  activityId,
  definitions,
  modelName,
  temperature,
}) => {
  const prompt = (messages) => {
    return `You are a data scientist whose job is to analyze conversations. You only speak JSON. Do not generate output that is not properly formatted JSON. Analyze the following conversation. Each line contains a single message in the conversation formatted as a JSON object:

${messages.map((message) => JSON.stringify(message)).join("\n")}

YOUR INSTRUCTION: Generate as many of these properties as possible:

${definitions
  .map(
    (definition) =>
      `${definition.name} (${definition.type}): ${definition.description}`
  )
  .join(`\n`)})}

ADDITIONAL INSTRUCTIONS:
Omit properties where there is not enough information to compute
it. Do not return an object if the value is null. If a property is an array, return 1 object for each item in the array.

REMEMBER, ONLY OUTPUT JSON. Produce as many of the ${
      definitions.length
    } requested properties as the given conversational context will allow.

EXAMPLE RESPONSE FORMAT:

[{ "name": "summary", "value": "John talks to Lisa", "type": "String" },
  { "name": "messageCount", "value": 40, "type": "Integer" },
  { "name": "topics", "value": "ruby", "type": "String" },
  { "name": "topics", "value": "javascript", "type": "String" }]

YOUR ANSWER:`;
  };

  const [text, _] = await generate({
    projectId,
    activityId,
    modelName,
    temperature,
    prompt,
  });

  if (text) {
    const jsonResult = JSON.parse(text);
    const finalResult = expandArrayProperties(jsonResult);
    return finalResult;
  } else {
    return [];
  }
};

export default resolveGenerateProperties;
