import { prisma, graph } from "source/data/db";
import { check, redirect, authorizeProject, aiReady } from "lib/auth";
import { syncActivities } from "lib/graph/mutations";
import { createEmbeddings } from "lib/vector/mutations";
import { getAPIUrl, getAPIData } from "lib/orbit/api";

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

    const projectId = project.id;

    const allData = [];
    let { url, apiKey, workspace } = project;
    // if a url is not provided, use the default
    if (!url) {
      url = getAPIUrl({ workspace });
    }

    // import a maximum of 100 new activities; start at page 1
    const page = 1;
    const pageLimit = 1;
    const handleRecords = async (records) => {
      for (let record of records) {
        let { sourceId } = record;
        await prisma.activity.upsert({
          where: {
            sourceId_projectId: {
              projectId,
              sourceId,
            },
          },
          update: {
            ...record,
          },
          create: {
            ...record,
          },
        });
      }
    };
    await getAPIData({
      url,
      apiKey,
      page,
      pageLimit,
      allData,
      project,
      handleRecords,
    });

    const activities = await prisma.activity.findMany({
      where: {
        projectId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100,
    });

    const count = await session.writeTransaction(async (tx) => {
      let count = await syncActivities({ tx, project, activities });
      return count;
    });

    // sync activities to the graph db
    // create embeddings if the project supports it
    if (aiReady(project)) {
      await createEmbeddings({ project, activities });
    }

    res.status(200).json({ result: { count } });
  } catch (err) {
    console.log("Could not refresh project", err);
    return res.status(500).json({ message: "Could not refresh project" });
  } finally {
    session.close();
  }
}
