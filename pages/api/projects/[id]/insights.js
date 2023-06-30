import GraphConnection from "lib/graphConnection";
import { check, redirect, authorizeProject } from "lib/auth";
import { getInsights } from "lib/graph/queries";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const graphConnection = new GraphConnection();
  var { id } = req.query;

  var project = await authorizeProject({ id, user, res });
  if (!project) {
    return;
  }
  const projectId = project.id;

  try {
    const props = { projectId, graphConnection };
    const result = {
      insights: await getInsights(props),
    };
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
