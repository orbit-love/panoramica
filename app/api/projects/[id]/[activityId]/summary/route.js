import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { StreamingTextResponse, LangChainStream } from "ai";
import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { loadQAStuffChain } from "langchain/chains";

import { graph } from "src/data/db";
import { checkApp, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { getConversation } from "src/data/graph/queries/getConversation";
import { updateActivity } from "src/data/graph/mutations";
import GraphConnection from "src/data/graph/Connection";
import { checkAILimits } from "src/integrations/ai/limiter";
import utils from "src/utils";

export async function GET(_, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id, activityId } = context.params;

  try {
    var project = await authorizeProject({ id, user, allowPublic: true });
    var projectId = project.id;
    if (!project) {
      return NextResponse("Summary not allowed for this project", {
        status: 401,
      });
    }

    if (!aiReady(project)) {
      return new NextResponse("AI not configured", {
        status: 401,
      });
    }

    const allDocs = [];
    const graphConnection = new GraphConnection();
    const messages = await getConversation({
      graphConnection,
      projectId,
      conversationId: activityId,
    });

    if (messages.length === 0) {
      return new NextResponse("No conversation found", {
        status: 401,
      });
    }

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
  less than 48 characters. If there is no information to provide a summary,
  simply return the messaged truncated to 50 characters.`;

    const question = `The context you have been given is a conversation
    that took place in an online community. Each message is given as
    a JSON object on a newline in chronological order.
    If a message is a reply to another message, the replyToMessageId
    property will point to the parent message. Given the context, please
    help with the following question or request.

    ${q}`;

    if (
      !checkAILimits({
        counterId: utils.hashString(project.modelApiKey),
        counterName: project.name,
        modelName: project.modelName,
        prompt: question,
      })
    ) {
      return NextResponse.json(
        {
          message:
            "Sorry, we couldn't process your request because the traffic is currently too high",
        },
        {
          status: 429,
        }
      );
    }

    const onCompletion = async (summary) => {
      const session = graph.session();
      try {
        await session.writeTransaction(async (tx) => {
          await updateActivity({
            tx,
            project,
            activityId,
            summary,
          });
        });
      } catch (e) {
        console.log("Couldn't save summary", e);
      } finally {
        session.close();
      }
    };
    const { stream, handlers } = LangChainStream({
      onCompletion,
    });

    chainA.call(
      {
        input_documents: docs,
        question,
      },
      [handlers]
    );

    return new StreamingTextResponse(stream);
  } catch (err) {
    // note that we don't get here if there is a failure once streaming is started
    return new NextResponse("Summary Failed", {
      status: 500,
    });
  }
}
