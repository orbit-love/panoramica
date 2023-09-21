import { graph } from "src/data/db";
import { check, redirect, authorizeProject } from "src/auth";
import { syncActivities } from "src/data/graph/mutations";
import { getAPIUrl, fetchActivitiesPage } from "src/integrations/orbit/api";
import { orbitImportReady } from "src/integrations/ready";

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

    let { url, apiKey, workspace } = project;
    // if a url is not provided, use the default
    if (!url) {
      url = getAPIUrl({ workspace });
    }

    const handleRecords = async (activities) => {
      // sync activities to the graph db
      // uuids are returned with new activities that typesense needs, so we
      // reassigning the activities variable
      await session.writeTransaction(async (tx) => {
        activities = await syncActivities({ tx, project, activities });
      });
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
