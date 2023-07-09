import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "lib/auth";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export async function GET(request, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;
  var q = request.nextUrl.searchParams.get("q");
  if (!q) {
    q = "orbit";
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

    // the client will not use the text in the vector store for rendering, it
    // will just use the metadata to find the activity locally; so save bytes and don't include values
    // but not seeming to work yet...
    const vectorDocs = await vectorStore.similaritySearch(q, 25, {
      // includeData: true,
      // includeMetadata: true,
    });
    return NextResponse.json({
      result: vectorDocs,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Could not perform search",
      },
      { status: 500 }
    );
  }
}
