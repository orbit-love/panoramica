import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";
import { PROJECT_CONVERSATIONS_CONTEXT_INTRO } from "./templates";
import { searchProjectConversations } from "../typesense";

const SIMILARITY_DISTANCE_THRESHOLD = 0.5;

export const executeFunction = async ({ project, input }) => {
  console.log(`[Assistant] Executing function: ${input}`);
  let jsonFunction;
  try {
    jsonFunction = JSON.parse(input);
  } catch (err) {
    console.error(err);
    return;
  }

  if (!jsonFunction.name || !jsonFunction.args) {
    console.error("[Assistant] Malformed JSON function");
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
    default:
      console.error(`[Assistant] Unknown Function name: ${jsonFunction.name}`);
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
  const documents = await searchProjectConversations({
    project,
    searchRequest: {
      q,
      query_by: "body,embedding",
      limit: 10,
    },
  });

  return documents.filter(
    (doc) => doc.distance <= SIMILARITY_DISTANCE_THRESHOLD
  );
}

async function searchDocumentation(project, q) {
  const collection = await getProjectQAsCollection({ project });
  if (!collection) {
    return [];
  }

  const searchResult = await collection.documents().search({
    q,
    query_by: "question,embedding",
    limit: 10,
  });

  return searchResult.hits
    .map((result) => result.map((hit) => hit.document))
    .filter((doc) => doc.distance <= SIMILARITY_DISTANCE_THRESHOLD);
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
