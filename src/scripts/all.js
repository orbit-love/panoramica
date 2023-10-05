import {
  pullActivities,
  loadActivities,
  postProcess,
  indexConversations,
} from "src/scripts/operations";

export const execute = async ({
  id,
  path,
  config,
  clear,
  startDate,
  endDate,
  pullFirst,
}) => {
  pullFirst && (await pullActivities({ id, path, startDate, endDate }));
  await loadActivities({ id, clear, config, path });
  await postProcess({ id });
  await indexConversations({ id, clear, startDate, endDate });
};

const main = async () => {
  const id = process.argv[2];

  if (!id) {
    console.error("Project id is required!");
    process.exit(1);
  }

  const configIndex = process.argv.indexOf("--config");
  if (configIndex === -1) {
    throw new Error("Config required to filter source & channel!");
  }
  const config = process.argv[configIndex + 1];

  const clear = process.argv.indexOf("--clear") > -1;

  const startDateFlag = process.argv.indexOf("--start-date");
  const endDateFlag = process.argv.indexOf("--end-date");

  const startDate = startDateFlag > -1 ? process.argv[startDateFlag + 1] : "";
  const endDate = endDateFlag > -1 ? process.argv[endDateFlag + 1] : "";

  const pathFlagIndex = process.argv.indexOf("--path");
  const pathFlag =
    pathFlagIndex === -1 ? null : process.argv[pathFlagIndex + 1];
  const path = pathFlag || `./tmp/${id}-${startDate}-${endDate}.json`;

  // if a path is provided, assume the activities are already there and we don't need
  // to do anything
  const pullFirst = !pathFlag;

  await execute({ id, path, config, clear, startDate, endDate, pullFirst });
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
