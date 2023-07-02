import { check, redirect, authorizeProject } from "lib/auth";
import { OpenAI } from "langchain/llms/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/document";
import { loadQAStuffChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export default async function handler(req, res) {
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

    const indexName = `skydeck-${process.env.NODE_ENV}`;
    const pineconeIndex = pinecone.Index(indexName);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex }
    );

    const vectorDocs = await vectorStore.similaritySearch(q, 10, {
      projectId,
    });
    console.log(vectorDocs);

    const model = new OpenAI({ modelName: "gpt-3.5-turbo-0613" });
    const chainA = loadQAStuffChain(model, {
      verbose: true,
    });
    const docs = vectorDocs.map((doc) => new Document(doc));
    const question = `
       You are a helpful assistant to help people answer questions about
       their community. The context you have been given is a series of messages in an
       online chat or forum community.

       Pleas answer this question in as much detail as possible: ${q}`;
    const result = await chainA.call({
      input_documents: docs,
      question,
    });

    // process the project
    res.status(200).json({ result });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
