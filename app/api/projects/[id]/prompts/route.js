import { graph } from "src/data/db";
import GraphConnection from "src/data/graph/Connection";
import {
  processRestrictedRequest,
  processPublicRequest,
} from "src/server/requests";
import { getPrompts } from "src/data/graph/queries/prompts";
import { updatePrompts } from "src/data/graph/mutations/prompts";

export async function GET(request, context) {
  return processPublicRequest(context, async ({ project }) => {
    const type = request.nextUrl.searchParams.get("type");
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
  return processRestrictedRequest(
    { ...context, body },
    async ({ project, body }) => {
      var { prompts } = body;
      const session = graph.session();
      const savedPrompts = await session.writeTransaction(async (tx) => {
        return await updatePrompts({ tx, project, prompts });
      });
      return { prompts: savedPrompts };
    }
  );
}
