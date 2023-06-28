import { prisma } from "lib/db";
import { check, redirect, authorizeProject } from "lib/auth";
import { getAPIData } from "lib/orbit/api";

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
      // only conversational activity types with referenced tweets, 180 days default
      let timeframe = `relative=this_90_days`;
      let queryString = `activity_type=discord%3Amessage%3Asent%2Cdiscord%3Amessage%3Areplied%2Cdiscord%3Athread%3Areplied%2Cissue_comment%3Acreated%2Cissues%3Aopened%2Cpull_requests%3Aopened%2Ctweet%3Asent&include_referenced_activities=true&${timeframe}`;
      url = `https://app.orbit.love/${workspace}/activities.json?${queryString}`;
    }

    // delete existing activities for the project
    await prisma.activity.deleteMany({
      where: {
        projectId: project.id,
      },
    });

    await getAPIData({ url, apiKey, page: 1, allData, prisma, project });

    // for some reason the orbit API returned duplicate tweets, so we delete any
    // duplicates here before sending to graph-db
    let deletedCount =
      await prisma.$executeRaw`DELETE FROM public. "Activity" a USING public. "Activity" b WHERE a.id < b.id AND a."sourceId" = b."sourceId"`;
    console.log("Deleted " + deletedCount + " duplicate records");

    // now that all activities are inserted, connect the parents
    // this really may not be necessary and could be super slow
    const activities = await prisma.activity.findMany({
      where: {
        projectId: project.id,
        sourceParentId: { not: null },
      },
    });

    for (let activity of activities) {
      if (activity.sourceParentId) {
        const parent = await prisma.activity.findFirst({
          where: { sourceId: activity.sourceParentId },
        });
        if (parent) {
          await prisma.activity.update({
            where: { id: activity.id },
            data: { parent: { connect: { id: parent.id } } },
          });
          console.log(
            `Connected activity ${activity.id} with parent ${parent.id}`
          );
        }
      }
    }

    res.status(200).json({ result: { count: allData.length } });
    console.log("Successfully imported activities");
  } catch (err) {
    console.log("Could not import activities", err);
    return res.status(500).json({ message: "Could not import activities" });
  }
}
