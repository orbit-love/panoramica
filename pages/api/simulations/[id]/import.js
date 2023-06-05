import { PrismaClient } from "@prisma/client";
import axios from "axios";

const getAPIData = async ({
  url,
  apiKey,
  prisma,
  simulation,
  page = 1,
  allData = [],
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(url, {
        params: {
          items: 100,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
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
        var githubIdentityId = member.relationships.identities.data.find(
          (item) => item.type == "github_identity"
        )?.id;
        var githubIdentity = included.find(
          (item) =>
            item.type === "github_identity" && item.id == githubIdentityId
        );
        var actor =
          discordIdentity?.attributes?.username ||
          githubIdentity?.attributes?.username;
        if (!actor) {
          continue;
        }

        var fields = {
          actor,
          timestamp,
          orbit_id,
          simulationId: simulation.id,
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
      if (nextUrl) {
        resolve(
          getAPIData({
            url: nextUrl,
            apiKey,
            prisma,
            simulation,
            page: page + 1,
            allData,
          })
        );
      } else {
        resolve(allData);
      }
    } catch (error) {
      reject(`Failed to fetch data: ${error}`);
    }
  });
};

export default async function handler(req, res) {
  const { id } = req.query;
  const prisma = new PrismaClient();

  try {
    const simulation = await prisma.simulation.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    const apiKey = process.env.ORBIT_API_KEY;
    const url = simulation.url;
    const allData = [];

    // delete existing activities for the simulation
    await prisma.activity.deleteMany({
      where: {
        simulationId: parseInt(id),
      },
    });

    await getAPIData({ url, apiKey, page: 1, allData, prisma, simulation });

    res.status(200).json({ result: { count: allData.length } });
    console.log("Successfully imported activities");
  } catch (err) {
    console.log("Could not import activities", err);
    return res.status(500).json({ message: "Could not import activities" });
  }
}
