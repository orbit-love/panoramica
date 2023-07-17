import GraphConnection from "src/data/graph/Connection";
import { check, redirect, authorizeProject } from "src/auth";
import { getThreads } from "src/data/graph/queries";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const graphConnection = new GraphConnection();
  var { id } = req.query;

  var project = await authorizeProject({ id, user, res });
  if (!project) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }
  const projectId = project.id;

  try {
    const props = { projectId, graphConnection };
    console.time("Fetching connections data");
    const result = {
      threads: await getThreads(props),
    };
    console.timeEnd("Fetching connections data");
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
