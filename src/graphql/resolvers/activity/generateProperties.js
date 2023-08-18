import { prisma } from "src/data/db";
import { OpenAI } from "langchain/llms/openai";
import resolveConversationJson from "./conversationJson";

const resolveGenerateProperties = async ({
  projectId,
  activityId,
  definitions,
  modelName,
  temperature,
}) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  const messages = await resolveConversationJson({
    projectId,
    activityId,
  });

  // if the activity is not a conversation, it will have no messages
  // and we can safely exit
  if (messages.length === 0) {
    return [];
  }

  modelName = modelName || project.modelName;
  temperature = temperature || 0;

  const model = new OpenAI({
    modelName,
    temperature,
    openAIApiKey: project.modelApiKey,
  });

  console.log(messages);

  const question = `You are a data scientist whose job is to analyze conversations.
  You only speak JSON. Do not generate output that is not properly formatted JSON.
  Analyze the following conversation. Each line contains a single message in the conversation
  formatted as a JSON object:

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
  it. Do not return an object if the value is null. If a property is an array, return
  1 object for each item in the array, along with a confidence
  score between 0 and 1 that indicates how confident you are that
  the property is accurate.

  REMEMBER, ONLY OUTPUT JSON. Produce as many of the ${
    definitions.length
  } requested properties as the given conversational context will allow.

  EXAMPLE RESPONSE FORMAT:

  [{ "name": "summary", "value": "John talks to Lisa", "type": "String" },
   { "name": "messageCount", "value": 40, "type": "Integer" },
   { "name": "topics", "value": "ruby", "type": "String", confidence: 0.9 },
   { "name": "topics", "value": "javascript", "type": "String", confidence: 0.2 }]


  YOUR ANSWER:`;

  const text = await model.call(question);

  console.log("RAW model text output\n\n" + text);

  const jsonResult = JSON.parse(text);
  const finalResult = [];

  // if any of the properties are arrays, we need to split them up
  // into new objects and add the to the final result
  for (let { name, value, type, confidence } of jsonResult) {
    if (Array.isArray(value)) {
      for (const item of value) {
        finalResult.push({
          name,
          type: type.replace("[", "").replace("]", ""),
          value: String(item),
          confidence,
        });
      }
    } else {
      finalResult.push({
        name,
        type,
        value: String(value),
        confidence,
      });
    }
  }
  console.log(JSON.stringify(finalResult, null, 2));

  return finalResult;
};

export default resolveGenerateProperties;
