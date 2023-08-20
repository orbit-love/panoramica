import { prisma } from "src/data/db";
import { OpenAI } from "langchain/llms/openai";
import resolveConversationJson from "./conversationJson";

export const generate = async ({
  projectId,
  activityId,
  modelName,
  temperature,
  prompt,
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

  if (typeof prompt === "function") {
    prompt = prompt(messages);
  }

  const now = new Date();
  const text = await model.call(prompt);
  const then = new Date();

  console.log("\n\n");
  console.log(
    `RAW OUTPUT Time:${then - now}ms Prompt:${prompt.length} Response:${
      text.length
    }\n---------------------\n${text}`
  );
  console.log("\n\n");
  return text;
};

export const expandArrayProperties = (jsonResult) => {
  const result = [];

  // if any of the properties are arrays, we need to split them up
  // into new objects and add the to the final result
  for (let { name, value, type, confidence } of jsonResult) {
    if (Array.isArray(value)) {
      for (const item of value) {
        result.push({
          name,
          type: type.replace("[", "").replace("]", ""),
          value: String(item),
          confidence,
        });
      }
    } else {
      result.push({
        name,
        type,
        value: String(value),
        confidence,
      });
    }
  }

  return result;
};
