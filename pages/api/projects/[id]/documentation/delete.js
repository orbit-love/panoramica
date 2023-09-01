import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { deleteQAsCollection } from "src/integrations/typesense";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return res.status(403).json({
        message: "You're not allowed to perform this action",
      });
    }

    if (project.userId != user.id && !user.admin) {
      return res.status(403).json({
        message: "You're not allowed to perform this action",
      });
    }

    if (!aiReady(project)) {
      return res.status(400).json({
        message: "Please set model and Typesens API keys on the project",
      });
    }

    // Drop the whole collection (if it exists) so that it's later rebuilt with the latest schema
    await deleteQAsCollection({ project });

    return res.status(200).json({
      result: "Successfully removed all indexed sources",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to remove the indexed sources",
    });
  }
}
