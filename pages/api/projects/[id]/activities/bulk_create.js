import { check, redirect, authorizeProject } from "src/auth";
import { graph } from "src/data/db";
import { syncActivities } from "src/data/graph/mutations";

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

    const activities = req.body;

    if (activities.length > 100) {
      return res.status(400).json({
        message: "You cannot create more than 100 activities at a time",
      });
    }

    // Validation
    for (const a of activities) {
      if (!a.sourceId || !a.timestamp || !a.globalActor || !a.source) {
        return res.status(400).json({
          message:
            "All activities should have the following fields: sourceId, timestamp, globalActor, source",
        });
      }
    }

    const session = graph.session();

    await session.writeTransaction(async (tx) => {
      await syncActivities(tx, project, activities);
    });

    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not bulk create activities", err);
    return res
      .status(500)
      .json({ message: "Could not bulk create activities" });
  }
}
