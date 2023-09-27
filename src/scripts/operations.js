import fs from "fs";
import { prisma, graph } from "src/data/db";
import {
  setupProject,
  clearProject,
  syncActivities,
  postProcessActivities,
} from "src/data/graph/mutations";
import { createJWT } from "src/auth";
import { ogm, Project } from "src/models";
import { gql } from "graphql-tag";
import {
  deleteConversationsCollection,
  indexConversations as indexConversationsTypesense,
} from "src/integrations/typesense";
import { getAPIUrl, fetchActivitiesPage } from "src/integrations/orbit/api";

export const pullActivities = async ({ id, path, startDate, endDate }) => {
  let where = { id };
  let project = await prisma.project.findFirst({
    where,
  });

  if (!project) {
    console.error("Project not found!");
    process.exit(1);
  }

  let { url, apiKey, workspace } = project;
  if (!url) {
    url = getAPIUrl({ workspace });
  }
  if (startDate) {
    url = `${url}&start_date=${startDate}`;
  }
  if (endDate) {
    url = `${url}&end_date=${endDate}`;
  }

  url = `${url}&direction=asc`;

  // clear out the file if it exists
  fs.writeFileSync(path, "");

  console.log("Writing activities to file " + path);

  var nextUrl = url;
  while (nextUrl) {
    const { activities, nextUrl: thisNextUrl } = await fetchActivitiesPage({
      url: nextUrl,
      apiKey,
    });

    // append the activities to a file
    for (var i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const data = JSON.stringify(activity);
      fs.appendFileSync(path, data);
      fs.appendFileSync(path, "\r\n");
    }
    console.log("Wrote activities " + activities.length);

    nextUrl = thisNextUrl;
  }

  console.log("pullActivities Complete!");
};

export const loadActivities = async ({ id, path, clear, setup }) => {
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

  if (setup) {
    await session.writeTransaction(async (tx) => {
      await setupProject({ tx, project, user: project.user });
    });
  }

  if (clear) {
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
};
export const postProcess = async ({ id }) => {
  const project = { id };
  const session = graph.session();
  console.log("Post processing begins");
  await session.writeTransaction(
    async (tx) => {
      try {
        console.log("Starting transaction");
        await postProcessActivities({ tx, project });
        console.log("Committing transaction");
      } catch (err) {
        console.log("Transaction failed", err);
        throw err;
      }
    },
    {
      timeout: 20000,
    }
  );
  await session.close();

  console.log("Post processing complete!");
};

export const indexConversations = async ({ id, clear, startDate, endDate }) => {
  const project = await prisma.project.findFirst({
    where: { id },
  });

  if (!project) {
    console.error("Project not found!");
    process.exit(1);
  }

  if (clear) {
    // Drop the whole collection (if it exists) so that it's rebuilt with the latest schema
    await deleteConversationsCollection({ project });
  }

  const user = { id: "123", admin: true };
  await ogm.init();
  const context = {
    user,
    token: createJWT(user),
  };

  const where = { id };
  const result = await Project.find({
    where,
    selectionSet: selectionSet(startDate, endDate),
    context,
  });

  const [{ conversations }] = result;

  // in batches of 100, process the conversations
  const batchSize = 100;
  const batches = [];
  for (let i = 0; i < conversations.length; i += batchSize) {
    batches.push(conversations.slice(i, i + batchSize));
  }
  console.log("Processing batches", batches.length);
  for (let batch of batches) {
    // the *Int timestamps are the BigInt data type and thus returned as
    // strings; before we can send them to Typesense, we need to convert them
    const result = await indexConversationsTypesense({
      project,
      conversations: batch.map((conversation) => ({
        ...conversation,
        firstActivityTimestampInt: parseInt(
          conversation.firstActivityTimestampInt
        ),
        lastActivityTimestamp: parseInt(conversation.lastActivityTimestampInt),
        properties: [
          ...conversation.properties,
          {
            name: "tags",
            type: "String",
            value: [],
          },
          {
            name: "title",
            type: "String",
            value: "",
          },
        ],
      })),
    });
    console.log("Indexed conversation batch - ", result.length);
  }

  console.log("Indexing complete!");
};

const selectionSet = (startDate, endDate) => {
  var where = "";
  if (startDate) {
    const unixTime = new Date(startDate).getTime();
    where += `firstActivityTimestampInt_GTE: ${unixTime}`;
    if (endDate) {
      where += `, `;
    }
  }
  if (endDate) {
    const unixTime = new Date(endDate).getTime();
    where += `lastActivityTimestampInt_LT: ${unixTime}`;
  }
  return gql`
    {
      conversations(where: {${where}}) {
        id
        source
        sourceChannel
        memberCount
        activityCount
        firstActivityTimestamp
        firstActivityTimestampInt
        lastActivityTimestamp
        lastActivityTimestampInt
        members {
          globalActor
          globalActorName
          globalActorAvatar
        }
        properties {
          name
          type
          value
        }
        descendants(options: { sort: { timestamp: ASC } }) {
          id
          sourceId
          actor
          actorName
          textHtml
          timestamp
          url
          parent {
            id
          }
          member {
            id
            globalActor
            globalActorName
            globalActorAvatar
          }
        }
      }
    }
  `;
};
