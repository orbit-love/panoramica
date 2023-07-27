import { LangChainStream } from "ai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";
import { ChatOpenAI } from "langchain/chat_models/openai";
import utils from "src/utils";
import {
  PROMPT_TEMPLATE,
  SINGLE_CONVERSATION_CONTEXT_INTRO,
  PROJECT_CONVERSATIONS_CONTEXT_INTRO,
} from "src/integrations/ai/templates";

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

const loadConversationDocsByVectorSearch = async (project, q) => {
  const vectorStore = await prepareVectorStore(project);
  const vectorDocs = await vectorStore.similaritySearch(q, 10);

  // get unique conversation ids from the vector docs
  const conversationIds = vectorDocs
    .map((doc) => doc.metadata.conversationId)
    .filter((conversationId) => conversationId)
    .filter(utils.onlyUnique);

  var conversationDocs = [];

  for (let conversationId of conversationIds) {
    const docs = await loadConversationDocs(project.id, conversationId);
    conversationDocs = conversationDocs.concat(docs);
    conversationDocs.push("\n--Next Conversation--\n");
  }

  return conversationDocs;
};

const prepareVectorStore = async (project) => {
  const { id, pineconeApiEnv, pineconeApiKey, pineconeIndexName } = project;
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: pineconeApiEnv,
    apiKey: pineconeApiKey,
  });
  const pineconeIndex = pinecone.Index(pineconeIndexName);
  var namespace = `project-${id}`;

  return await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: project.modelApiKey,
    }),
    { pineconeIndex, namespace }
  );
};

export const getAnswerStream = async ({ project, q, chat, subContext }) => {
  const chatHistory = formatChat([...chat, q]);

  const { stream, handlers } = LangChainStream();

  const conversationDocs = await loadConversationDocs(
    project.id,
    subContext?.conversationId
  );

  let contextIntro, context;

  if (conversationDocs.length > 0) {
    // Conversation context
    contextIntro = SINGLE_CONVERSATION_CONTEXT_INTRO;
    // We always want the whole conversation. Augment later with product documentation
    context = conversationDocs;
  } else {
    // Project level context
    contextIntro = PROJECT_CONVERSATIONS_CONTEXT_INTRO;
    // Search for vector entries mapping the prompt and turn them into conversation docs
    context = await loadConversationDocsByVectorSearch(project, q);
  }

  const llm = new ChatOpenAI({
    modelName: project.modelName,
    openAIApiKey: project.modelApiKey,
    temperature: 0.3,
    streaming: true,
  });

  const prompt = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);

  new LLMChain({ llm, prompt }).call(
    {
      context_intro: contextIntro,
      context: context.join("\n"),
      chat_history: chatHistory,
    },
    [handlers]
  );

  return stream;
};
