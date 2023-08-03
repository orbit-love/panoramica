import GraphConnection from "src/data/graph/Connection";
import { processRequest } from "src/server/requests";
import { getPrompts } from "src/data/graph/queries/prompts";
import { updatePrompts } from "src/data/graph/mutations/prompts";

export async function GET(request, context) {
  return processRequest(context, async ({ project, params }) => {
    const type = request.nextUrl.searchParams.get("type");
    console.log(params);
    const graphConnection = new GraphConnection();
    const projectId = project.id;
    var prompts =
      (await getPrompts({
        graphConnection,
        projectId,
      })) || [];
    if (type) {
      prompts = prompts.filter((prompt) => prompt.type === type);
    }
    return { prompts };
  });
}

export async function PUT(request, context) {
  const body = await request.json();
  return processRequest({ ...context, body }, async ({ project, body }) => {
    var { prompts } = body;
    const session = graph.session();
    const savedPrompts = await session.writeTransaction(async (tx) => {
      return await updatePrompts({ tx, project, prompts });
    });
    return { prompts: savedPrompts };
  });
}
