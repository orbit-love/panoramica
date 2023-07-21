import { LangChainStream } from "ai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatMessageHistory } from "langchain/memory";
import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";
import { ChatOpenAI } from "langchain/chat_models/openai";

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
    allDocs.push({ pageContent: JSON.stringify(message) });
  }
  return allDocs;
};

const formatQuestionForConversation = (q) =>
  `The context you have been given is a conversation
    that took place in an online community. Each message is given as
    a JSON object on a newline in chronological order.
    If a message is a reply to another message, the replyToMessageId
    property will point to the parent message. In your reply, always format
    dates and times in a human-readable fashion such as "June 1 at 10pm" or "2 hours and 5 minutes".
    Be succinct and don't explain your work unless asked. Do not return messageIds
    in the response. Now, given the context, please
    help with the following question or request:

    ${q}`;

const formatQuestionForVectorDocs = (q) => `
The context you have been given is a series of messages in an
online chat community. Please format the response with 2 newlines
between paragraphs.

Please answer this question about the community: ${q}`;

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
  // Start with an empty history and use the chat to fill it
  let history = new ChatMessageHistory();
  for (const i in chat) {
    if (i % 2) {
      await history.addUserMessage(chat[i]);
    } else {
      await history.addAIChatMessage(chat[i]);
    }
  }

  const { stream, handlers } = LangChainStream();

  const conversationDocs = await loadConversationDocs(
    project.id,
    subContext?.conversationId
  );

  let question, retriever;

  if (conversationDocs.length > 0) {
    // Conversation context
    question = formatQuestionForConversation(q);
    retriever = {
      getRelevantDocuments(_) {
        // We always want the whole conversation. Augment later with product documentation
        return conversationDocs;
      },
    };
  } else {
    // Project level context
    question = formatQuestionForVectorDocs(q);
    retriever = (await prepareVectorStore(project)).asRetriever();
  }

  const model = new ChatOpenAI({
    modelName: project.modelName,
    openAIApiKey: project.modelApiKey,
    temperature: 0.5,
    streaming: true,
  });

  ConversationalRetrievalQAChain.fromLLM(model, retriever, {}).call(
    { question, chat_history: history },
    [handlers]
  );

  return stream;
};
