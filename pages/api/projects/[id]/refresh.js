import { graph } from "src/data/db";
import { check, redirect, authorizeProject, createJWT } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { syncActivities } from "src/data/graph/mutations";
import { getAPIUrl, fetchActivitiesPage } from "src/integrations/orbit/api";
import { orbitImportReady } from "src/integrations/ready";
import { indexConversations } from "src/integrations/typesense";

import { ogm, Project } from "src/models";

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

    let { id: projectId, url, apiKey, workspace } = project;
    // if a url is not provided, use the default
    if (!url) {
      url = getAPIUrl({ workspace });
    }

    await ogm.init();
    const context = {
      user,
      token: createJWT(user),
    };

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
          ({ conversation }) => conversation.id
        );

        // iterate over the conversationIds and load the activities for each one
        for (let conversationId of conversationIds) {
          const result = await Project.find({
            where: { id: projectId },
            selectionSet: `
            {
              conversations(where: { id: "${conversationId}" }) {
                id
                descendants(options: { sort: { timestamp: ASC } }) {
                  id
                  source
                  sourceChannel
                  globalActorName
                  textHtml
                  timestamp
                }
              }
            }`,
            context,
          });
          const [
            {
              conversations: [{ descendants: conversationActivities }],
            },
          ] = result;
          conversations[conversationId] = conversationActivities;
        }

        // index conversations
        await indexConversations({ project, conversations });
      }
    };

    const { activities } = await fetchActivitiesPage({
      url,
      apiKey,
    });

    await handleRecords(activities);

    res.status(200).json({ result: { count: activities.length } });
  } catch (err) {
    console.log("Could not refresh project", err);
    return res.status(500).json({ message: "Could not refresh project" });
  } finally {
    session.close();
  }
}
