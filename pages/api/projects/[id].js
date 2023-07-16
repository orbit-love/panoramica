import GraphConnection from "lib/graphConnection";
import { check, redirect, authorizeProject } from "lib/auth";
import { getEverything } from "lib/graph/queries";

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

  // default from and to to values that will not filter anything
  from = from || "1900-01-01";
  to = to || "2100-01-01";

  try {
    const props = { projectId, graphConnection, from, to };

    console.time("Fetching graph data");
    // these can all go async to be much faster, they don't depend on each other
    let [threads, members, activities, connections] = await getEverything(
      props
    );
    console.timeEnd("Fetching graph data");

    const result = {
      threads,
      members,
      activities,
      connections,
    };
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: "failed to load data" });
    console.log(err);
  } finally {
    await graphConnection.close();
  }
}
