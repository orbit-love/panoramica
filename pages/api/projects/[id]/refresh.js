import { graph } from "src/data/db";
import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { syncActivities } from "src/data/graph/mutations";
import { getActivities } from "src/data/graph/queries/conversations";
import { getAPIUrl, getAPIData } from "src/integrations/orbit/api";
import { orbitImportReady } from "src/integrations/ready";
import GraphConnection from "src/data/graph/Connection";
import { indexConversations } from "src/integrations/typesense";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const session = graph.session();
  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return res.status(400).json({ message: "Could not refresh project" });
    }
    if (!orbitImportReady(project)) {
      return res.status(400).json({ message: "Could not refresh project" });
    }

    const allData = [];
    let { id: projectId, url, apiKey, workspace } = project;
    // if a url is not provided, use the default
    if (!url) {
      url = getAPIUrl({ workspace });
    }

    // import a maximum of 100 new activities; start at page 1
    const page = 1;
    const pageLimit = 1;

    const handleRecords = async (activities) => {
      // sync activities to the graph db
      // uuids are returned with new activities that typesense needs, so we
      // reassigning the activities variable
      await session.writeTransaction(async (tx) => {
        activities = await syncActivities({ tx, project, activities });
      });

      // create embeddings if the project supports it
      if (aiReady(project)) {
        // map the incoming activities to unique conversationIds
        var conversations = {};
        var conversationIds = activities.map(
          ({ conversationId }) => conversationId
        );

        // iterate over the conversationIds and load the activities for each one
        const graphConnection = new GraphConnection();
        for (let conversationId of conversationIds) {
          conversations[conversationId] = await getActivities({
            projectId,
            conversationId,
            graphConnection,
          });
        }

        // index conversations
        await indexConversations({ project, conversations });
      }
    };

    await getAPIData({
      url,
      apiKey,
      page,
      pageLimit,
      allData,
      project,
      handleRecords,
    });

    res.status(200).json({ result: { count: allData.length } });
  } catch (err) {
    console.log("Could not refresh project", err);
    return res.status(500).json({ message: "Could not refresh project" });
  } finally {
    session.close();
  }
}
