import { check, redirect, authorizeProject, aiReady } from "src/auth";
import { getActivities } from "src/data/graph/queries";
import GraphConnection from "src/data/graph/Connection";
import {
  createEmbeddings,
  deleteEmbeddings,
} from "src/integrations/pinecone/embeddings";

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;
  try {
    var project = await authorizeProject({ id, user, res });
    var projectId = project.id;
    if (!project) {
      return;
    }

    if (!aiReady(project)) {
      res.status(400).json({
        message: "Please set model and vector store API keys on the project",
      });
      return;
    }

    // delete existing embeddings
    await deleteEmbeddings({ project });

    // create embeddings for all activities
    const graphConnection = new GraphConnection();
    const activities = await getActivities({
      graphConnection,
      projectId,
    });

    await createEmbeddings({ project, activities });
    res.status(200).json({ result: "success" });
  } catch (err) {
    console.log("Could not process project", err);
    return res.status(500).json({ message: "Could not process project" });
  }
}
