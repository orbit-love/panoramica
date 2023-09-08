import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { findOrCreateProjectQasCollection } from "src/integrations/typesense";
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
        message: "Please set model and search API keys on the project",
      });
    }

    var { type, sourceName, specificFields } = await req.body;

    const collection = await findOrCreateProjectQasCollection({ project });
    if (!collection) {
      return res.status(500).json({
        message:
          "Could not find or create your collection. Make sure your model and search API Keys are accurate and try again",
      });
    }

    console.log(specificFields);

    switch (type) {
      case "web":
        scheduleJob("WebToQas", sourceName, {
          projectId: id,
          sourceName,
          startUrl: specificFields.startUrl,
          rootUrl: specificFields.rootUrl,
        });
        break;
      case "conversations":
        scheduleJob("ConversationsToQas", sourceName, {
          projectId: id,
          sourceName,
          source: specificFields.source,
          sourceChannel: specificFields.sourceChannel,
          actors: specificFields.actors,
        });
        break;
      case "markdown":
        scheduleJob("MarkdownToQas", sourceName, {
          projectId: id,
          sourceName,
          type: "markdown",
          markdown: specificFields.markdown,
          reference: {},
        });
    }

    return res.status(200).json({
      result: "Your source is being processed in the background",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to process your source",
    });
  }
}
