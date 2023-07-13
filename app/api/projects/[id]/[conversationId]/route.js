import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "lib/auth";
import { getConversation } from "lib/graph/ai/queries";
import { updateActivity } from "lib/graph/mutations";
import GraphConnection from "lib/graphConnection";

export async function PUT(req, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  const session = graph.session();
  var { id, conversationId } = context.params;
  try {
    var project = await authorizeProject({ id, user });
    if (!project) {
      return redirect("/");
    }

    // Get data submitted in request's body.
    const data = await req.json();
    const { summary } = data;
    let activityId = conversationId;

    await session.writeTransaction(async (tx) => {
      await updateActivity({ tx, project, activityId, summary });
    });
    return NextResponse.json({ result: true });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Update failed" },
      {
        status: 500,
      }
    );
  }
}

export async function GET(_, context) {
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

    return NextResponse.json({ result: { count: messages.length, messages } });
  } catch (err) {
    console.log(err);
    return new NextResponse("Operation failed", {
      status: 500,
    });
  }
}
