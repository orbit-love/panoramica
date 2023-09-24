import { postProcessActivities } from "src/data/graph/mutations";
import { graph } from "src/data/db";

const main = async () => {
  const id = process.argv[2];

  if (process.argv.length === 2) {
    console.error("Project id is required!");
    process.exit(1);
  }

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

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .then(() => {
    console.log("Exiting!");
    process.exit(0);
  });
