import { postProcess } from "src/scripts/postProcess";

const main = async () => {
  const id = process.argv[2];

  if (process.argv.length === 2) {
    console.error("Project id is required!");
    process.exit(1);
  }

  await postProcess({ id });
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
