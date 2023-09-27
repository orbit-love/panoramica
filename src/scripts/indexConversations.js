import { indexConversations } from "src/scripts/operations";

const main = async () => {
  if (process.argv.length < 3) {
    console.error("Project id is required!");
    process.exit(1);
  }

  const id = process.argv[2];
  const clear = process.argv.indexOf("--clear") > -1;

  const startDateFlag = process.argv.indexOf("--start-date");
  const endDateFlag = process.argv.indexOf("--end-date");

  const startDate = startDateFlag > -1 ? process.argv[startDateFlag + 1] : null;
  const endDate = endDateFlag > -1 ? process.argv[endDateFlag + 1] : null;

  await indexConversations({ id, clear, startDate, endDate });
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
