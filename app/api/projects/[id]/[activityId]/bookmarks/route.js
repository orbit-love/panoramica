import { processRequest } from "src/server/requests";
import { createBookmark, deleteBookmark } from "src/data/graph/mutations";

export async function POST(_, context) {
  return processRequest(context, async ({ project, params, user }) => {
    var { activityId } = params;
    const session = graph.session();
    await session.writeTransaction(async (tx) => {
      await createBookmark({ tx, project, activityId, user });
    });
    return true;
  });
}

export async function DELETE(_, context) {
  return processRequest(context, async ({ project, params, user }) => {
    var { activityId } = params;
    const session = graph.session();
    await session.writeTransaction(async (tx) => {
      await deleteBookmark({ tx, project, activityId, user });
    });
    return true;
  });
}
