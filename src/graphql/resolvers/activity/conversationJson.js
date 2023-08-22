import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";

const resolveConversationJson = async ({ projectId, activityId }) => {
  const graphConnection = new GraphConnection();
  const messages = await getConversation({
    graphConnection,
    projectId,
    conversationId: activityId,
  });
  return messages;
};

export default resolveConversationJson;
