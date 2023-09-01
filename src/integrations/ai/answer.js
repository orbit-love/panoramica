import { LangChainStream } from "ai";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";
import { ChatOpenAI } from "langchain/chat_models/openai";
import utils from "src/utils";
import {
  SINGLE_CONVERSATION_CONTEXT_INTRO,
  PROMPT_TEMPLATE_WITH_CONTEXTS,
  FUNCTION_PROMPT_TEMPLATE,
} from "src/integrations/ai/templates";
import { checkAILimits } from "./limiter";
import { executeFunction, formatFunctionOutput } from "./functions";

const formatChat = (chat) => {
  const people = ["Me", "AI"];
  let i = 0;
  return chat.map((message) => `${people[i++ % 2]}: ${message}`).join("\n");
};

const loadConversationDocs = async (projectId, conversationId) => {
  if (!conversationId) return [];
  const allDocs = [];
  const graphConnection = new GraphConnection();
  const messages = await getConversation({
    graphConnection,
    projectId,
    conversationId,
  });
  for (let message of messages) {
    allDocs.push(JSON.stringify(message));
  }
  return allDocs;
};

export const callLLM = async ({
  project,
  promptTemplate,
  promptArgs,
  streaming = false,
}) => {
  const { modelName, modelApiKey } = project;
  const formattedPrompt = utils.formatUnicornString(promptTemplate, promptArgs);

  if (
    !checkAILimits({
      counterId: utils.hashString(modelApiKey),
      counterName: project.name,
      prompt: formattedPrompt,
      modelName,
    })
  ) {
    return;
  }

  const llm = new ChatOpenAI({
    modelName,
    openAIApiKey: modelApiKey,
    temperature: 0.3,
    streaming: streaming,
  });

  if (streaming) {
    const { stream, handlers } = LangChainStream();
    const prompt = PromptTemplate.fromTemplate(promptTemplate);
    // Unfortunately we can pass in the formattedPrompt because it might have a lot of curly braces from JSON Docs
    // And langchain would attempt to find the arguments
    new LLMChain({ llm, prompt, verbose: !!process.env.DEVELOPMENT }).call(
      promptArgs,
      [handlers]
    );
    return stream;
  }

  return await llm.predict(formattedPrompt);
};

export const getFunctionAnswer = async ({ project, q, chat, subContext }) => {
  const chatHistory = formatChat([...chat, q]);

  const conversationDocs = await loadConversationDocs(
    project.id,
    subContext?.conversationId
  );

  let contextIntro = "",
    context = "";

  if (conversationDocs.length > 0) {
    // Conversation context
    contextIntro = SINGLE_CONVERSATION_CONTEXT_INTRO;
    // We always want the whole conversation. Augment later with product documentation
    context = conversationDocs.join("\n");
  }

  let promptArgs = {
    chat_history: chatHistory,
    context_intro: contextIntro,
    context: `Context: ${context}`,
  };

  const result = await callLLM({
    project,
    promptArgs,
    promptTemplate: FUNCTION_PROMPT_TEMPLATE,
  });
  if (!result) {
    // Rate Limit issue
    return;
  }

  const functionOutput = await executeFunction({ project, input: result });
  if (!functionOutput) {
    throw new Error(`[Assistant] Could not execute the function: ${result}`);
  }

  return functionOutput;
};

export const getAnswerStreamFromFunctionOutput = async ({
  project,
  q,
  chat,
  subContext,
  functionOutput,
}) => {
  const chatHistory = formatChat([...chat, q]);

  const conversationDocs = await loadConversationDocs(
    project.id,
    subContext?.conversationId
  );

  let contextIntro = "",
    context = "";

  if (conversationDocs.length > 0) {
    // Conversation context
    contextIntro = SINGLE_CONVERSATION_CONTEXT_INTRO;
    // We always want the whole conversation. Augment later with product documentation
    context = conversationDocs.join("\n");
  }

  const promptArgs = {
    chat_history: chatHistory,
    context_intro: contextIntro,
    context: context,
    additional_context_intro: `Additional Context:`,
    additional_context: await formatFunctionOutput(project, functionOutput),
  };

  return await callLLM({
    project,
    promptArgs,
    promptTemplate: PROMPT_TEMPLATE_WITH_CONTEXTS,
    streaming: true,
  });
};
