import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { scheduleJob } from "src/workers";

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
        message: "Please set model and vector store API keys on the project",
      });
    }

    var { startUrl, rootUrl } = await req.body;

    scheduleJob("CrawlPages", rootUrl, { startUrl, rootUrl, projectId: id });

    return res.status(200).json({
      result: "Your documentation is being imported in the background",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to embed the documentation",
    });
  }
}
