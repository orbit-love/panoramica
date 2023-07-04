import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { StreamingTextResponse, LangChainStream } from "ai";

import { checkApp, authorizeProject } from "lib/auth";
import { OpenAI } from "langchain/llms/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";
import { loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

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

    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_API_ENV,
      apiKey: process.env.PINECONE_API_KEY,
    });
    var namespace = `project-${projectId}`;

    const indexName = process.env.PINECONE_INDEX_NAME;
    const pineconeIndex = pinecone.Index(indexName);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
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

    const model = new OpenAI({
      modelName: "gpt-3.5-turbo-0613",
      temperature: 0.5,
      streaming: true,
    });
    const chainA = loadQAStuffChain(model, { verbose: true });
    const docs = vectorDocs.map((doc) => new Document(doc));
    const question = `
       The context you have been given is a series of messages in an
       online chat community. Please format the response with 2 newlines
       between paragraphs.

       Pleas answer this question about the community: ${q}`;
    chainA.call(
      {
        input_documents: docs,
        question,
      },
      [handlers]
    );

    return new StreamingTextResponse(stream);
  } catch (err) {
    return NextResponse.json(
      {
        message: "Could not process project",
      },
      { status: 500 }
    );
  }
}
