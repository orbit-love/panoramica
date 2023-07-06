import { prisma } from "lib/db";
import { check, redirect, authorizeProject } from "lib/auth";
import { getAPIUrl, getAPIData } from "lib/orbit/api";
import { deleteActivities } from "lib/mutations";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

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

    // delete existing activities for the project
    await deleteActivities(project);

    // import a maximum of 1,000 activities; start at page 1
    const page = 1;
    const pageLimit = 10;
    const handleRecords = async (records) => {
      // this is a quick and dirty way to remove duplicate sourceId from
      // the same batch - the Orbit API has returned two activities with the same
      // source id at times
      var sourceIds = records.map((r) => r.sourceId);
      records = records.filter((record, index) => {
        return sourceIds.indexOf(record.sourceId) === index;
      });
      // do a bulk insert for speed
      await prisma.activity.createMany({
        data: records,
      });
      console.log("Created activities: " + records.length);
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
    return res.status(500).json({ message: "Could not import activities" });
  }
}
