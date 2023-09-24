import fs from "fs";
import { prisma } from "src/data/db";
import { getAPIUrl } from "src/integrations/orbit/api";
import { fetchActivitiesPage } from "src/integrations/orbit/api";

const main = async () => {
  if (process.argv.length < 4) {
    console.error("Project id is required!");
    process.exit(1);
  }

  const id = process.argv[2];
  const path = process.argv[3];

  const startDate = "2021-01-01";
  const endDate = "2024-01-01";

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

  console.log("Writing to file " + path);

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

  console.log("Complete!");
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
