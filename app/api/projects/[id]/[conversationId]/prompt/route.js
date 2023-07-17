import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { StreamingTextResponse, LangChainStream } from "ai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";
import { loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { checkApp, authorizeProject } from "src/auth";
import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";

export async function GET(request, context) {
  const { stream, handlers } = LangChainStream();

  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id, conversationId } = context.params;
  var q = request.nextUrl.searchParams.get("q");
  if (!q) {
    q = "Please summarize this conversation in 1 sentence or less.";
  }
  try {
    var project = await authorizeProject({ id, user });
    var projectId = project.id;
    if (!project) {
      return;
    }

    const { pineconeApiEnv, pineconeApiKey, pineconeIndexName } = project;
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: pineconeApiEnv,
      apiKey: pineconeApiKey,
    });
    const pineconeIndex = pinecone.Index(pineconeIndexName);
    var namespace = `project-${projectId}`;

    // send the entire conversation to the vector DB PLUS
    // what the instructions match
    // const vectorStore = await PineconeStore.fromExistingIndex(
    //   new OpenAIEmbeddings(),
    //   { pineconeIndex, namespace }
    // );
    // const vectorDocs = await vectorStore.similaritySearch(q, 10);
    // const docs = vectorDocs.map((doc) => new Document(doc));

    // the prompt looks like
    // this conversation: conversation messages
    // general context related to the community: general docs
    // question

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

    const model = new OpenAI({
      modelName: project.modelName,
      openAIApiKey: project.modelApiKey,
      temperature: 0,
      streaming: true,
    });
    const chainA = loadQAStuffChain(model);
    const docs = allDocs.map((doc) => new Document(doc));
    const question = `The context you have been given is a conversation
    that took place in an online community. Each message is given as
    a JSON object on a newline in chronological order.
    If a message is a reply to another message, the replyToMessageId
    property will point to the parent message. In your reply, always format
    dates and times in a human-readable fashion such as "June 1 at 10pm" or "2 hours and 5 minutes".
    Be succinct and don't explain your work unless asked. Do not return messageIds
    in the response. Now, given the context, please
    help with the following question or request:

    ${q}`;

    chainA.call(
      {
        input_documents: docs,
        question,
      },
      [handlers]
    );

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
    return new NextResponse("Drat. Could not process request.", {
      status: 500,
    });
  }
}
