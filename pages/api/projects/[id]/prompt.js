import { check, redirect, authorizeProject } from "lib/auth";
import { OpenAI } from "langchain/llms/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";
import { loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export default async function GET(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  var { id, q } = req.query;
  if (!q) {
    q = "What was the most recent activity in this community?";
  }
  try {
    var project = await authorizeProject({ id, user, res });
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
      res.status(400).json({
        message:
          "No information exists that could help provide an answer. Please try another query.",
      });
      return;
    }

    var tokens = [];
    const model = new OpenAI({
      modelName: "gpt-3.5-turbo-0613",
      temperature: 0.5,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            res.write(token);
            tokens.push(token);
          },
        },
      ],
    });
    const chainA = loadQAStuffChain(model, {
      verbose: true,
    });
    const docs = vectorDocs.map((doc) => new Document(doc));
    const question = `
       The context you have been given is a series of messages in an
       online chat community. Please format the response with 2 newlines
       between paragraphs.

       Pleas answer this question about the community: ${q}`;
    await chainA.call({
      input_documents: docs,
      question,
    });

    console.log(tokens);
    res.end();
  } catch (err) {
    console.log("Could not process prompt", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
