import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import GraphConnection from "lib/graphConnection";
import { loadQAStuffChain } from "langchain/chains";

import { check, redirect, authorizeProject } from "lib/auth";
import { getConversation } from "lib/graph/ai/queries";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id, conversationId } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    var projectId = project.id;
    if (!project) {
      return;
    }

    const graphConnection = new GraphConnection();

    const messages = await getConversation({
      graphConnection,
      projectId,
      conversationId,
    });

    const llmA = new OpenAI({ modelName: "gpt-3.5-turbo-0613" });
    const chainA = loadQAStuffChain(llmA, {
      verbose: true,
    });
    const docs = messages.map(
      (message) => new Document({ pageContent: JSON.stringify(message) })
    );

    const question = `Each piece of context above is a JSON document that represents
       1 message in a threaded conversation on a chat forum for a product community.
       The replyToMessageId can be used to link replies to parents.
       Please reply in plain text with: a 2-3 sentence summary and a bullet point
       list of each participant and a rating between 1-5 of how involved they were.
       Don't prefix the summary with any extra context, be succinct.`;

    const resA = await chainA.call({
      input_documents: docs,
      question,
    });

    res.status(200).json({ result: resA });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
