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
import c from "src/configuration/common";

export async function GET(request, context) {
  const { stream, handlers } = LangChainStream();

  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;
  var q = request.nextUrl.searchParams.get("q");
  if (!q) {
    q = "What was the most recent activity in this community?";
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

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: project.modelApiKey,
      }),
      { pineconeIndex, namespace }
    );

    const vectorDocs = await vectorStore.similaritySearch(q, 10);
    if (vectorDocs.length === 0) {
      return NextResponse.json(
        {
          message:
            "No information exists that could help provide an answer. Please try another query.",
        },
        { status: 400 }
      );
    }

    // get unique conversation ids from the vector docs
    const conversationIds = vectorDocs
      .map((doc) => doc.metadata.conversationId)
      .filter((conversationId) => conversationId)
      .filter(c.onlyUnique);

    var conversations = [];

    const graphConnection = new GraphConnection();
    for (let conversationId of conversationIds) {
      const messages = await getConversation({
        graphConnection,
        projectId,
        conversationId,
      });
      conversations.push(
        messages.map((message) => JSON.stringify(message)).join("\n")
      );
    }

    const model = new OpenAI({
      modelName: project.modelName,
      openAIApiKey: project.modelApiKey,
      temperature: 0.5,
      streaming: true,
    });
    const chainA = loadQAStuffChain(model);
    const docs = conversations.map(
      (conversation) => new Document({ pageContent: conversation })
    );
    const question = `
       The context you have been given is a set of conversations from an
       online chat community. Each conversation is separated by empty lines.
       Inside each conversation, each message is given as
       a JSON object on a newline. The messages are in chronological order.
       If a message is a reply to another message, the replyToMessageId
       property will point to the parent message.
       In your reply, always format
      dates and times in a human-readable fashion such as "June 1 at 10pm" or "2 hours and 5 minutes".
      Be succinct and don't explain your work unless asked. Do not return messageIds
      in the response.
       Now, given the context, please
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
