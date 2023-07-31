import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "src/auth";
import { prepareVectorStore } from "src/integrations/pinecone";
import { getActivities } from "src/data/graph/queries/conversations";
import { toPageContent } from "src/integrations/pinecone/embeddings";
import GraphConnection from "src/data/graph/Connection";

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
      return NextResponse.json(
        {
          message: "Could not perform search",
        },
        { status: 401 }
      );
    }

    var conversationId = activityId;
    const graphConnection = new GraphConnection();
    var activities = await getActivities({
      projectId,
      conversationId,
      graphConnection,
    });
    var q = toPageContent(activities);

    var namespace = `project-conversations-${projectId}`;
    const vectorStore = await prepareVectorStore({ project, namespace });

    var vectorDocs = await vectorStore.similaritySearchWithScore(q, 25, {
      contentLength: { $gt: 150 },
    });

    // filter out the match for the conversation itself
    vectorDocs = vectorDocs.filter(([doc, _]) => doc.metadata.id != activityId);

    // get unique conversation ids from the vector docs
    const result = vectorDocs.map(([doc, score]) => ({
      ...doc.metadata,
      score,
    }));

    return NextResponse.json({
      q,
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
