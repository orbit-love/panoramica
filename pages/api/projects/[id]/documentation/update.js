import { check, redirect, authorizeProject } from "src/auth";
import { aiReady } from "src/integrations/ready";
import { crawl } from "src/data/crawler";
import {
  createDocumentationEmbeddings,
  deleteDocumentationEmbeddings,
} from "src/integrations/pinecone/embeddings";

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

    console.log("[Documentation] Crawling...");
    const pages = await crawl({
      startUrl,
      rootUrl,
    });
    console.log(`[Documentation] Found ${pages.length} pages`);

    console.log("[Documentation] Removing current embeddings.");
    await deleteDocumentationEmbeddings({ project });
    console.log("[Documentation] Adding new embeddings.");
    await createDocumentationEmbeddings({ project, pages });

    return res.status(200).json({
      result: `${pages.length} documentation pages have been embedded`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to embed the documentation",
    });
  }
}
