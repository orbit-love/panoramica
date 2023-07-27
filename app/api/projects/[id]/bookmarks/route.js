import GraphConnection from "src/data/graph/Connection";
import { processRequest } from "src/server/requests";
import { getBookmarks } from "src/data/graph/queries/bookmarks";

export async function GET(_, context) {
  return processRequest(context, async ({ project, user }) => {
    const graphConnection = new GraphConnection();
    const projectId = project.id;
    const userId = user.id;
    const bookmarks = await getBookmarks({
      graphConnection,
      projectId,
      userId,
    });
    return { bookmarks };
  });
}
