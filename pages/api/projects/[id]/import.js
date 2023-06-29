import { check, redirect, authorizeProject } from "lib/auth";
import { getAPIUrl, getAPIData } from "lib/orbit/api";
import { deleteActivities, deleteDuplicates } from "lib/mutations";

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

    // todo - filter out any duplicate source ids above, we need to have the constraint
    // for some reason the orbit API returned duplicate tweets, so we delete any
    // duplicates here before sending to graph-db
    // await deleteDuplicates(project);

    res.status(200).json({ result: { count: allData.length } });
    console.log("Successfully imported activities");
  } catch (err) {
    console.log("Could not import activities", err);
    return res.status(500).json({ message: "Could not import activities" });
  }
}
