import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { StreamingTextResponse } from "ai";

import { checkApp, authorizeProject } from "src/auth";

import { getAnswerStream } from "src/ai/answer";

export async function POST(request, context) {
  const user = await checkApp();
  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;

  // Alternating messages from Human and AI
  var { chat, subContext } = await request.json();

  // q is supposedely the last question from the Human
  var q = chat.pop();
  if (!q) {
    q = "What was the most recent activity in this community?";
  }

  try {
    var project = await authorizeProject({ id, user });
    if (!project) {
      return;
    }

    const stream = await getAnswerStream({
      project,
      chat,
      q,
      subContext,
    });

    return new StreamingTextResponse(stream);
  } catch (err) {
    console.log(err);
    return new NextResponse("Drat. Could not process request.", {
      status: 500,
    });
  }
}
