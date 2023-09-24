import fs from "fs";
import { prisma, graph } from "src/data/db";
import {
  setupProject,
  clearProject,
  syncActivities,
} from "src/data/graph/mutations";

const main = async () => {
  if (process.argv.length < 3) {
    console.error("Project id and file path is required!");
    process.exit(1);
  }

  const id = process.argv[2];
  const path = process.argv[3];

  let where = { id };
  let project = await prisma.project.findFirst({
    where,
    select: {
      id: true,
      name: true,
      demo: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!project) {
    console.error("Project not found!");
    process.exit(1);
  }

  const activities = [];
  const lines = fs.readFileSync(path, "utf-8").split("\n").filter(Boolean);
  for (const line of lines) {
    if (line) {
      const json = JSON.parse(line);
      activities.push(json);
    }
  }

  // split activities into batches of 100
  console.log("Ready to insert " + activities.length + " activities");

  const session = graph.session();

  // ensure indices are there for importing - without it is 1000x slower
  // this causes crashes for some reason, so just leave them out for now
  // await session.run("CREATE CONSTRAINT ON (p:Project) ASSERT p.id IS UNIQUE");
  // await session.run("CREATE INDEX ON :Project(id)");

  await session.run("CREATE CONSTRAINT ON (m:Member) ASSERT m.id IS UNIQUE");
  await session.run("CREATE CONSTRAINT ON (m:Member) ASSERT m.key IS UNIQUE");
  await session.run("CREATE INDEX ON :Member(id)");
  await session.run("CREATE INDEX ON :Member(key)");

  await session.run("CREATE CONSTRAINT ON (a:Activity) ASSERT a.id IS UNIQUE");
  await session.run("CREATE CONSTRAINT ON (a:Activity) ASSERT a.key IS UNIQUE");
  await session.run("CREATE INDEX ON :Activity(id)");
  await session.run("CREATE INDEX ON :Activity(key)");

  await session.run(
    "CREATE CONSTRAINT ON (c:Conversation) ASSERT c.id IS UNIQUE"
  );
  await session.run(
    "CREATE CONSTRAINT ON (c:Conversation) ASSERT c.key IS UNIQUE"
  );
  await session.run("CREATE INDEX ON :Conversation(id)");
  await session.run("CREATE INDEX ON :Conversation(key)");

  await session.run("CREATE CONSTRAINT ON (i:Identity) ASSERT i.key IS UNIQUE");
  await session.run("CREATE INDEX ON :Identity(key)");

  console.log("Indices created");

  if (process.argv[4] === "--setup") {
    await session.writeTransaction(async (tx) => {
      await setupProject({ tx, project, user: project.user });
    });
  }

  if (process.argv[4] === "--clear") {
    await session.writeTransaction(async (tx) => {
      await clearProject({ tx, project });
    });
  }

  var totalCount = 0;
  const batchSize = 1000;
  const batches = [];
  while (activities.length > 0) {
    const batch = activities.splice(0, batchSize);
    batches.push(batch);
  }
  // go through each batch and write it to the db with flushActivities
  for (var i = 0; i < batches.length; i++) {
    const batch = batches[i];
    await session.writeTransaction(async (tx) => {
      let startTime = performance.now();
      await syncActivities({ tx, project, activities: batch });
      let endTime = performance.now();
      totalCount += batch.length;
      console.log(
        "Batch written in " +
          Math.round(endTime - startTime) +
          " ms; total:" +
          totalCount +
          "; batch: " +
          batch.length +
          "; size: " +
          batch.length
      );
    });
  }

  console.log("Reading file line by line with readline done.");
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );
};

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .then(() => {
    console.log("Exiting!");
    process.exit(0);
  });
