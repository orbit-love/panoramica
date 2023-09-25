import {
  deleteConversationsCollection,
  indexConversations,
} from "src/integrations/typesense";
import { prisma } from "src/data/db";
import { createJWT } from "src/auth";
import { gql } from "graphql-tag";
import { ogm, Project } from "src/models";

const main = async () => {
  if (process.argv.length < 3) {
    console.error("Project id is required!");
    process.exit(1);
  }

  const projectId = process.argv[2];

  let where = { id: projectId };
  let project = await prisma.project.findFirst({
    where,
  });

  if (!project) {
    console.error("Project not found!");
    process.exit(1);
  }

  if (process.argv[3] === "--clear") {
    // Drop the whole collection (if it exists) so that it's rebuilt with the latest schema
    await deleteConversationsCollection({ project });
  }

  const user = { id: "123", admin: true };
  await ogm.init();
  const context = {
    user,
    token: createJWT(user),
  };

  const result = await Project.find({
    where: { id: projectId },
    selectionSet,
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
    await indexConversations({
      project,
      conversations: batch.map((conversation) => ({
        ...conversation,
        firstActivityTimestampInt: parseInt(
          conversation.firstActivityTimestampInt
        ),
        lastActivityTimestamp: parseInt(conversation.lastActivityTimestampInt),
      })),
    });
    console.log("Indexed conversation batch - ", batch.length);
  }

  console.log("Indexing complete!");
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

const selectionSet = gql`
  {
    conversations {
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
