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

const PROMPT_TEMPLATE = `
You're an AI that helps me answer some questions about the online community I manage.
{context_intro}
Context: {context}
Please use the messages above when possible to answer my questions.

On going chat between Me and You:
{chat_history}

Task: Based on the provided context, answer me.

Note: in your reply, always format dates and times in a human-readable fashion such as "June 1 at 10pm" or "2 hours and 5 minutes".
Be succinct and don't explain your work unless asked. Do not return messageIds in the response. If the context doesn't help, say so.

Your answer:
`;

const SINGLE_CONVERSATION_CONTEXT_INTRO = `
The following context is a conversation that took place in my community.
Each message is given as a JSON object on a newline in chronological order.
If a message is a reply to another message, the replyToMessageId
property will point to the parent message.
`;

const PROJECT_CONVERSATIONS_CONTETXT_INTRO = `
These are one or more conversations that took place in my community.
Each message is given as a JSON object on a newline in chronological order.
Separate conversations are separated by 2 blank lines and the words "Next Conversation".
If a message is a reply to another message, the replyToMessageId property will point to the parent message
`;

const formatChat = (chat) => {
  const people = ["Me", "AI"];
  let i = 0;
  return chat.reduce(
    (result, message) => `${result}${people[i++ % 2]}: ${message}\n`,
    ""
  );
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
    conversationDocs.push("\n\n--Next Conversation--\n\n");
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
    contextIntro = PROJECT_CONVERSATIONS_CONTETXT_INTRO;
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

  const chain = new LLMChain({ llm, prompt });

  chain.call(
    {
      context: context.join(""),
      context_intro: contextIntro,
      chat_history: chatHistory,
    },
    [handlers]
  );

  return stream;
};
