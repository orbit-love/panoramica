import { check, redirect, authorizeProject } from "src/auth";
import { graph } from "src/data/db";
import { margeActivityLinks } from "src/data/graph/mutations";

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

    const projectId = project.id;
    await session.writeTransaction(async (tx) => {
      const { records } = await tx.run(
        `MATCH (p:Project { id: $projectId })-[:OWNS]-(a:Activity)
          WITH a ORDER BY a.timestampInt DESC
          RETURN a`,
        { projectId }
      );
      const activities = records.map((record) => record.get("a").properties);
      console.log("Loaded activities...");

      const batchSize = 100;
      for (let i = 0; i < activities.length; i += batchSize) {
        const batch = activities.slice(i, i + batchSize);
        console.log(`Updating activities ${i} to ${i + batchSize}...`);
        await margeActivityLinks({ tx, activities: batch, project });
      }
    });

    res.status(200).json({ result: "ok" });
    console.log("Successfully repaired activities");
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
