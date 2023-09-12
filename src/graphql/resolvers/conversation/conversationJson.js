import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";

const resolveConversationJson = async ({ projectId, conversationId }) => {
  const graphConnection = new GraphConnection();
  const messages = await getConversation({
    graphConnection,
    projectId,
    conversationId,
  });
  return messages;
};

export default resolveConversationJson;
