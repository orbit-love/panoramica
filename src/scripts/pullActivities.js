import { pullActivities } from "src/scripts/operations";

const main = async () => {
  const id = process.argv[2];
  const pathFlag = process.argv.indexOf("--path");

  if (!id || pathFlag === -1) {
    console.error("Project id and path are required!");
    process.exit(1);
  }

  const path = process.argv[pathFlag + 1];

  const startDateFlag = process.argv.indexOf("--start-date");
  const endDateFlag = process.argv.indexOf("--end-date");

  const startDate = startDateFlag > -1 ? process.argv[startDateFlag + 1] : null;
  const endDate = endDateFlag > -1 ? process.argv[endDateFlag + 1] : null;

  await pullActivities({ id, path, startDate, endDate });
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
