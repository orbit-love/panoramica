import getSimilarConversations from "src/graphql/resolvers/similarConversations";
import searchConversations from "src/graphql/resolvers/searchConversations";

const resolvers = {
  Project: {
    async searchConversations(parent, args) {
      const { id: projectId } = parent;
      const { query } = args;
      if (query === "do-not-search") {
        return [];
      } else {
        return searchConversations({
          projectId,
          query,
        });
      }
    },
  },
  Activity: {
    async similarConversations(parent) {
      const { id: activityId, project, descendants } = parent;
      if (!project || !descendants) {
        // these fields must be included in the query
        return null;
      }
      const { id: projectId } = project;
      return getSimilarConversations({
        projectId,
        activityId,
        descendants,
      });
    },
  },
};

export default resolvers;
