import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { StreamingTextResponse } from "ai";
import { checkApp, authorizeProject } from "src/auth";
import { callLLM } from "src/integrations/ai/answer";

const handler = async function (request, context) {
  const user = await checkApp();

  if (!user) {
    return redirect("/");
  }

  var { id } = context.params;

  // Alternating messages from Human and AI
  var { chat } = await request.json();

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

    const formatChat = (chat) => {
      const people = ["Me", "AI"];
      let i = 0;
      return chat.map((message) => `${people[i++ % 2]}: ${message}`).join("\n");
    };

    const chatHistory = formatChat([...chat, q]);
    const promptTemplate = `
      You're an AI that has conversations.

      Ongoing chat between Me and You:
      {chat_history}

      Your answer:
    `;

    const promptArgs = {
      chat_history: chatHistory,
    };

    const stream = await callLLM({
      project,
      promptTemplate,
      promptArgs,
      streaming: true,
    });

    // Unfortunately we can pass in the formattedPrompt because it might have a lot of curly braces from JSON Docs
    // And langchain would attempt to find the arguments

    if (stream) {
      return new StreamingTextResponse(stream);
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
};

export { handler as POST, handler as GET };
