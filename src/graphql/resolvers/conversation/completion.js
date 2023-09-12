import { prisma } from "src/data/db";
import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";

import { loadQAStuffChain } from "langchain/chains";
import resolveConversationJson from "./conversationJson";

const resolveCompletion = async ({
  projectId,
  conversationId,
  prompt,
  modelName,
  temperature,
}) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
  });

  const allDocs = [];
  const messages = await resolveConversationJson({
    projectId,
    conversationId,
  });

  for (let message of messages) {
    allDocs.push({ pageContent: JSON.stringify(message) });
  }

  modelName = modelName || project.modelName;
  temperature = temperature || 0.1;

  const model = new OpenAI({
    modelName,
    temperature,
    openAIApiKey: project.modelApiKey,
  });
  const chainA = loadQAStuffChain(model);
  const docs = allDocs.map((doc) => new Document(doc));

  const question = `The context you have been given is a conversation
    that took place in an online community. Each message is given as
    a JSON object on a newline in chronological order.
    If a message is a reply to another message, the replyToMessageId
    property will point to the parent message. Given the context, please
    help with the following question or request.

    ${prompt}`;

  const { text } = await chainA.call({
    input_documents: docs,
    question,
  });

  return text;
};

export default resolveCompletion;
