import { eventEmitter } from "./events";
import { prisma } from "src/data/db";
import {
  searchProjectConversations,
  toFilters,
} from "src/integrations/typesense";
import { getConversation } from "src/data/graph/queries/getConversation";
import GraphConnection from "src/data/graph/Connection";
import TurndownService from "turndown";

const conversationsToQasCallbacks = {
  perform: async (job) => {
    const data = job.data;
    if (!data.projectId || !data.sourceName) {
      return "Invalid Data";
    }

    const project = await prisma.project.findFirst({
      where: { id: data.projectId },
    });

    if (!project) return "Project not found";

    const { sourceName, source, sourceChannel, actors } = data;

    const filters = toFilters(
      {
        source: source,
        source_channel: sourceChannel,
        actors: actors,
      },
      {
        comparators: {
          source: ":",
          source_channel: ":",
          actors: ":",
        },
      }
    );

    const documents = await searchProjectConversations({
      project,
      searchRequest: {
        q: "*",
        query_by: "body",
        exclude_fields: "embedding",
        filter_by: filters,
        limit: 100,
      },
    });

    console.log(
      `[Worker][ProcessQasConversationsSource] Found ${documents.length} conversations`
    );

    const graphConnection = new GraphConnection();
    const turndownService = new TurndownService({ headingStyle: "atx" });

    for (let { id } of documents) {
      if (id) {
        const activities = await getConversation({
          graphConnection,
          projectId: project.id,
          conversationId: id,
          transformActivity: (activity, _, member) => ({
            url: activity.url,
            markdown: turndownService.turndown(activity.textHtml),
            author: member.globalActorName,
            timestampInt: activity.timestampInt,
          }),
        });

        const markdown = activities
          .map((activity) => `${activity.author}\n${activity.markdown}`)
          .join("\n");

        eventEmitter.emit("scheduleJob", "MarkdownToQas", id, {
          projectId: data.projectId,
          markdown,
          sourceName,
          type: "conversations",
          reference: {
            id,
            url: activities[0].url,
            timestamp: activities[activities.length - 1].timestampInt,
          },
        });
      }
    }
  },
  onCompleted: (job, returnValue) => {
    console.log(`Job ${job.name} completed and returned:`);
    console.log(returnValue);
  },
  onFailed: (job, error) => {
    console.error(`Job ${job.name} failed with the following error:`);
    console.error(error);
  },
};

export default conversationsToQasCallbacks;
