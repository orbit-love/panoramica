import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";
import { prepareVectorStore } from "src/integrations/pinecone";
import utils from "src/utils";
import { PROJECT_CONVERSATIONS_CONTEXT_INTRO } from "./templates";

const SIMILARY_SCORE_THRESHOLD = 0.78;

export const executeFunction = async ({ project, input }) => {
  console.log(`[LLM Function] received input: ${input}`);
  let jsonFunction;
  try {
    jsonFunction = JSON.parse(input);
  } catch (err) {
    console.log(err);
    return;
  }

  if (!jsonFunction.name || !jsonFunction.args) {
    console.log("Malformed JSON function");
    return;
  }

  switch (jsonFunction.name) {
    case "answer":
      return { ...jsonFunction, output: jsonFunction.args[0] };
    case "search_conversations":
      return {
        ...jsonFunction,
        output: await searchConversations(project, jsonFunction.args[0]),
      };
    case "search_documentation":
      return {
        ...jsonFunction,
        output: await searchDocumentation(project, jsonFunction.args[0]),
      };
    case "search_conversations_and_documentation":
      return {
        ...jsonFunction,
        output: [
          await searchConversations(project, jsonFunction.args[0]),
          await searchDocumentation(project, jsonFunction.args[1]),
        ],
      };
  }
};

export const formatFunctionOutput = async (project, functionOutput) => {
  switch (functionOutput.name) {
    case "search_conversations":
      return formatConversations(
        await expandConversations(project, functionOutput.output)
      );
    case "search_documentation":
      return formatDocumentation(functionOutput.output);
    case "search_conversations_and_documentation":
      return `
      ${formatConversations(
        await expandConversations(project, functionOutput.output)
      )}
      ${formatDocumentation(functionOutput.output)}
      `;
  }
};

async function searchConversations(project, q) {
  const vectorStore = await prepareVectorStore({ project });
  const results = await vectorStore.similaritySearchWithScore(q, 10);

  // get unique conversation ids from the vector docs
  return results
    .filter(([_, score]) => score >= SIMILARY_SCORE_THRESHOLD)
    .map(([doc, _]) => doc.metadata.conversationId)
    .filter((conversationId) => conversationId)
    .filter(utils.onlyUnique)
    .map((id) => ({ id }));
}

async function searchDocumentation(project, q) {
  const vectorStore = await prepareVectorStore({
    project,
    namespace: `project-documentation-${project.id}`,
  });
  const results = await vectorStore.similaritySearchWithScore(q, 3);
  return results
    .filter(([_, score]) => score >= SIMILARY_SCORE_THRESHOLD)
    .map(([vectorDoc, score]) => ({
      url: vectorDoc.metadata.id,
      title: vectorDoc.metadata.title,
      body: vectorDoc.metadata.body,
      score,
    }));
}

function formatConversations(expandedConversations) {
  return `Conversations:\n
    ${expandedConversations
      .map((conversation) =>
        conversation.map((doc) => JSON.stringify(doc)).join("\n")
      )
      .join("\n----Next Conversation----\n")}\n
      ${PROJECT_CONVERSATIONS_CONTEXT_INTRO}
  `;
}

function formatDocumentation(documentation) {
  return `Documentation pages: ${documentation
    .map((page) => JSON.stringify(page))
    .join("\n")}`;
}

async function expandConversations(project, conversations) {
  const graphConnection = new GraphConnection();

  var allDocs = [];

  for (let { id } of conversations) {
    if (id) {
      const docs = await getConversation({
        graphConnection,
        projectId: project.id,
        conversationId: id,
      });

      if (allDocs) {
        allDocs.push(docs);
      }
    }
  }

  return allDocs;
}
