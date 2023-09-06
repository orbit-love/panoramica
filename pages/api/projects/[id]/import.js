import { check, redirect, authorizeProject } from "src/auth";
import { getAPIUrl, getAPIData } from "src/integrations/orbit/api";
import { graph } from "src/data/db";
import { syncActivities } from "src/data/graph/mutations";
import { orbitImportReady } from "src/integrations/ready";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  const session = graph.session();

  const json = req.body;
  var { startDate, endDate } = json;

  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
    }
    if (!orbitImportReady(project)) {
      return;
    }

    const allData = [];
    let { url, apiKey, workspace } = project;

    // if these fields are provided, set no page limit
    const manualPageLimit = url || startDate || endDate;

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

    const handleRecords = async (records) => {
      // this is a quick and dirty way to remove duplicate sourceId from
      // the same batch - the Orbit API has returned two activities with the same
      // source id at times
      var sourceIds = records.map((r) => r.sourceId);
      const activities = records.filter((record, index) => {
        return sourceIds.indexOf(record.sourceId) === index;
      });

      const createdActivities = await session.writeTransaction(async (tx) => {
        return await syncActivities({ tx, activities, project });
      });

      console.log("Created activities: " + createdActivities.length);
    };

    const pageLimit = manualPageLimit ? -1 : 10;

    await getAPIData({
      url,
      apiKey,
      pageLimit,
      allData,
      project,
      handleRecords,
    });

    res.status(200).json({ result: { count: allData.length } });
    console.log("Successfully imported activities");
  } catch (err) {
    console.log("Could not import activities", err);
    return res.status(500).json({
      message:
        "Snap! The project import failed. Please edit the project settings and verify that a valid Orbit workspace id and API key have been provided.",
    });
  } finally {
    session.close();
  }
}
