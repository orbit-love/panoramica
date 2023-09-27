import {
  pullActivities,
  loadActivities,
  postProcess,
  indexConversations,
} from "src/scripts/operations";

export const execute = async ({ id, path, clear, startDate, endDate }) => {
  await pullActivities({ id, path, startDate, endDate });
  await loadActivities({ id, clear, path });
  await postProcess({ id });
  await indexConversations({ id, clear, startDate, endDate });
};

const main = async () => {
  const id = process.argv[2];

  if (!id) {
    console.error("Project id and path are required!");
    process.exit(1);
  }

  const clear = process.argv.indexOf("--clear") > -1;

  const startDateFlag = process.argv.indexOf("--start-date");
  const endDateFlag = process.argv.indexOf("--end-date");

  const startDate = startDateFlag > -1 ? process.argv[startDateFlag + 1] : "";
  const endDate = endDateFlag > -1 ? process.argv[endDateFlag + 1] : "";

  const path = `./tmp/${id}-${startDate}-${endDate}.json`;

  await execute({ id, path, clear, startDate, endDate });
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
