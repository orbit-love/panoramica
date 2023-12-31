import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { checkApp, authorizeProject } from "src/auth";

import { getFunctionAnswer } from "src/integrations/ai/answer";

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
    var project = await authorizeProject({ id, user, allowPublic: true });
    if (!project) {
      return NextResponse.json(
        {
          message: "You are not allowed to perform this action",
        },
        {
          status: 401,
        }
      );
    }

    const result = await getFunctionAnswer({
      project,
      chat,
      q,
      subContext,
    });

    if (result) {
      return NextResponse.json({
        result,
      });
    }

    return NextResponse.json(
      {
        message:
          "Sorry, we couldn't process your request because the traffic is currently too high",
      },
      {
        status: 429,
      }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message:
          "Sorry we couldn't process your request due to an unexpected error.",
      },
      {
        status: 500,
      }
    );
  }
}
