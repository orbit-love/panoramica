import { loadActivities } from "src/scripts/operations";

const main = async () => {
  if (process.argv.length < 3) {
    console.error("Project id and file path is required!");
    process.exit(1);
  }

  const id = process.argv[2];
  const path = process.argv[3];
  const setup = process.argv.indexOf("--setup") > -1;
  const clear = process.argv.indexOf("--clear") > -1;

  const configIndex = process.argv.indexOf("--config");
  if (configIndex === -1) {
    throw new Error("Config required to filter source & channel!");
  }
  const config = process.argv[configIndex + 1];

  await loadActivities({ id, path, clear, setup, config });
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
