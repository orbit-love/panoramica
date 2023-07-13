import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { StreamingTextResponse, LangChainStream } from "ai";
import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { loadQAStuffChain } from "langchain/chains";

import { checkApp, authorizeProject } from "lib/auth";
import { getConversation } from "lib/graph/ai/queries";
import GraphConnection from "lib/graphConnection";

export async function GET(_, context) {
  const { stream, handlers } = LangChainStream();

  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id, conversationId } = context.params;

  try {
    var project = await authorizeProject({ id, user });
    var projectId = project.id;
    if (!project) {
      return;
    }

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
      temperature: 0.5,
      streaming: true,
    });
    const chainA = loadQAStuffChain(model);
    const docs = allDocs.map((doc) => new Document(doc));

    var q = `Please provide a title for this conversation in 48 characters or less.
  Provide only the title in the response and no punctuation. The response must be
  less than 48 characters. If there isn't enough information to provide a good summary,
  simply return the first 50 characters of the first message.`;

    const question = `The context you have been given is a conversation
    that took place in an online community. Each message is given as
    a JSON object on a newline in chronological order.
    If a message is a reply to another message, the replyToMessageId
    property will point to the parent message. Given the context, please
    help with the following question or request.

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
    return new NextResponse("Summary Failed", {
      status: 500,
    });
  }
}
