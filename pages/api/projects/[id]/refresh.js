import { graph } from "src/data/db";
import { check, redirect, authorizeProject, aiReady } from "src/auth";
import { syncActivities } from "src/data/graph/mutations";
import { createEmbeddings } from "src/integrations/pinecone/embeddings";
import { getAPIUrl, getAPIData } from "src/integrations/orbit/api";

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
      return;
    }

    const allData = [];
    let { url, apiKey, workspace } = project;
    // if a url is not provided, use the default
    if (!url) {
      url = getAPIUrl({ workspace });
    }

    // import a maximum of 100 new activities; start at page 1
    const page = 1;
    const pageLimit = 1;

    const handleRecords = async (activities) => {
      // sync activities to the graph db
      // uuids are returned with new activities that pinecone needs, so we
      // reassing the activities variable
      await session.writeTransaction(async (tx) => {
        activities = await syncActivities({ tx, project, activities });
      });

      // create embeddings if the project supports it
      if (aiReady(project)) {
        await createEmbeddings({ project, activities });
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
