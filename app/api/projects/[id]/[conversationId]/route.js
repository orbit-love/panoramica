import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "lib/auth";
import { getConversation } from "lib/graph/ai/queries";
import GraphConnection from "lib/graphConnection";

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
