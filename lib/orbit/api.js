import axios from "axios";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const sort = "love";
const items = 100;
const maxPages = 10;

const getAPIData = async (url, apiKey, page = 1, allData = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, {
        params: {
          sort,
          items,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      var members = response.data.data;
      console.log("Fetched members: ", members.length);
      for (var i = 0; i < members.length; i++) {
        var member = members[i].attributes;
        var fields = {
          slug: member.slug,
          name: member.name || member.slug,
          level: member.orbit_level,
          love: member.love,
          reach: member.reach,
          first_activity_at: member.first_activity_occurred_at,
          last_activity_at: member.last_activity_occurred_at,
        };
        await prisma.member.upsert({
          where: {
            slug: member.slug,
          },
          create: fields,
          update: fields,
        });
        console.log("Created member " + member.slug);
      }

      allData.push(...members);

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
  `https://app.orbit.love/api/v1/${orbitWorkspace}/members`,
  orbitApiKey,
  1
)
  .then((data) => console.log("Done; Fetched members: " + data.length))
  .catch((err) => console.log(err));
