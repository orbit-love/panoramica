import { check, redirect, authorizeProject } from "src/auth";
import { getAPIUrl, getAPIData } from "src/integrations/orbit/api";
import { graph } from "src/data/db";
import { setupProject, syncActivities } from "src/data/graph/mutations";
import { orbitImportReady } from "src/integrations/ready";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  const session = graph.session();

  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
    }
    if (!orbitImportReady(project)) {
      return;
    }

    const allData = [];
    var pageLimit = 10;
    let { url, apiKey, workspace } = project;

    if (url) {
      // if a url is provided, allow the url to control how much
      // data is imported via timeframe or other filters
      pageLimit = 100;
    } else {
      // if a url is not provided, generate it
      url = getAPIUrl({ workspace });
      pageLimit = 10;
    }
    console.log("Using Import URL ", url);

    await session.writeTransaction(async (tx) => {
      await setupProject({ tx, project, user });
    });

    // import a maximum of 1,000 activities; start at page 1
    const page = 1;

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
