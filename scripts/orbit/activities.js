import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const items = 100;
const maxPages = 10;

const getAPIData = async (url, apiKey, page = 1, allData = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, {
        params: {
          items,
          saved_view_id: "discord_activities",
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      var activities = response.data.data;
      var included = response.data.included;
      console.log("Fetched activities: ", activities.length);
      for (var i = 0; i < activities.length; i++) {
        var activity = activities[i];

        var orbit_id = activity.id;
        var timestamp = activity.attributes.occurred_at;

        // get the actor
        var memberId = activity.relationships.member.data.id;
        var member = included.find(
          (item) => item.type === "member" && item.id == memberId
        );
        var discordIdentityId = member.relationships.identities.data.find(
          (item) => item.type == "discord_identity"
        )?.id;
        var discordIdentity = included.find(
          (item) =>
            item.type === "discord_identity" && item.id == discordIdentityId
        );
        var actor = discordIdentity?.attributes?.username;
        if (!actor) {
          continue;
        }

        var fields = {
          actor,
          timestamp,
          orbit_id,
        };
        await prisma.activity.upsert({
          where: {
            orbit_id,
          },
          create: fields,
          update: fields,
        });
        console.log("Created activity " + orbit_id + " from " + actor);
      }

      allData.push(...activities);

      // This assumes that the API returns a JSON object with a 'nextPage' property
      // that's null when there are no more pages.
      var nextUrl = response.data.links?.next;
      if (nextUrl && page <= maxPages) {
        resolve(getAPIData(nextUrl, apiKey, page + 1, allData));
      } else {
        resolve(allData);
      }
    } catch (error) {
      reject(`Failed to fetch data: ${error}`);
    }
  });
};

const orbitWorkspace = process.env.ORBIT_WORKSPACE;
const orbitApiKey = process.env.ORBIT_API_KEY;
// Start fetching data
getAPIData(
  `https://app.orbit.love/api/v1/${orbitWorkspace}/activities`,
  orbitApiKey,
  1
)
  .then((data) => console.log("Done; Fetched activities: " + data.length))
  .catch((err) => console.log(err));
