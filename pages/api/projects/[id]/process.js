import { graph } from "src/data/db";
import { check, redirect, authorizeProject } from "src/auth/auth";
import { syncProject } from "src/data/graph/mutations";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const session = graph.session();
  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
    }

    const count = await session.writeTransaction(async (tx) => {
      let count = await syncProject({ tx, project });
      return count;
    });

    res.status(200).json({ result: { count } });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  } finally {
    session.close();
  }
}
