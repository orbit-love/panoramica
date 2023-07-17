import GraphConnection from "src/data/graph/Connection";
import { check, redirect, authorizeProject } from "src/auth/auth";
import { getActivities } from "src/data/graph/queries";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const graphConnection = new GraphConnection();
  var { id, from, to } = req.query;

  var project = await authorizeProject({ id, user, res });
  if (!project) {
    return;
  }
  const projectId = project.id;

  from = from || "1900-01-01";
  to = to || "2100-01-01";

  try {
    const props = { projectId, graphConnection, to, from };
    console.time("Fetching activities data");
    const result = {
      activities: await getActivities(props),
    };
    console.timeEnd("Fetching activities data");
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
