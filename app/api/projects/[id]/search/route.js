import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "src/auth";
import { prepareVectorStore } from "src/integrations/pinecone";

export async function GET(request, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;
  var q = request.nextUrl.searchParams.get("q");

  try {
    var project = await authorizeProject({ id, user, allowPublic: true });
    var projectId = project.id;
    if (!project) {
      return NextResponse.json(
        {
          message: "Could not perform search",
        },
        { status: 401 }
      );
    }

    var namespace = `project-${projectId}`;
    const vectorStore = await prepareVectorStore({ project, namespace });

    const vectorDocs = await vectorStore.similaritySearchWithScore(q, 25, {
      contentLength: { $gt: 50 },
    });

    const result = vectorDocs.map(([doc, score]) => ({
      ...doc.metadata,
      score,
    }));

    return NextResponse.json({
      result,
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
