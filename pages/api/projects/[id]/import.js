import { check, redirect, authorizeProject } from "src/auth";
import { getAPIUrl } from "src/integrations/orbit/api";
import { orbitImportReady } from "src/integrations/ready";
import { queue } from "src/workers/orbit/importActivities";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  const json = req.body;
  var { startDate, endDate } = json;

  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!orbitImportReady(project)) {
      res.status(403).json({ message: "Not configured for Orbit import" });
      return;
    }

    let { url, workspace } = project;
    if (!url) {
      url = getAPIUrl({ workspace });
    }
    if (startDate) {
      url = `${url}&start_date=${startDate}`;
    }
    if (endDate) {
      url = `${url}&end_date=${endDate}`;
    }
    console.log("Using Import URL ", url);

    await queue.add(url, {
      project,
      url,
    });

    res.status(200).json({ result: { status: "Enqueued" } });
    console.log("Orbit import enqueued");
  } catch (err) {
    console.log("Could not enqueue Orbit import", err);
    return res.status(500).json({
      message: "Creating the import failed. Please check the logs.",
    });
  }
}
