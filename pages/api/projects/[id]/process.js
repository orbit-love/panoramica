import { check, redirect, authorizeProject } from "lib/auth";
import { syncProject } from "lib/graph/mutations";

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

    // process the project
    let count = await syncProject(project);
    res.status(200).json({ result: { count } });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
