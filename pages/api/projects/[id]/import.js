import { prisma } from "lib/db";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

const getTypeFields = ({ activity, member, included }) => {
  // option 1 - default actor / name from identities
  // const identity = getAnyIdentity({ member, included });
  // const actor =
  //   identity.attributes.username ||
  //   identity.attributes.email ||
  //   identity.attributes.uid;
  // const actorName = identity.attributes.name;
  // const actorFields = { actor, actorName };

  // option 2 - default actor / name from member
  const actorFields = {
    actor: member.attributes.slug,
    actorName: member.attributes.name || member.attributes.slug,
  };

  // the goal though is to pull the actor id from the platform
  switch (activity.type) {
    // set actor and actor_name to the local version where possible
    // actor should be the username or equivalent
    case "tweet_activity":
      const tweet = activity.attributes.t_tweet;
      const sourceId = tweet.id_str;
      // pull out the strings for the mentions and annotations
      const mentions = (
        tweet.entities.mentions || tweet.entities.user_mentions
      ).map((mention) => mention.username || mention.screen_name);
      const entities = (tweet.entities.annotations || [])?.map(
        (annotation) => annotation.normalized_text
      );
      function extractHashtags(s) {
        return s.match(/#\w+/g) || [];
      }
      const hashtags = extractHashtags(tweet.text);

      // look to see if the tweet is a reply and grab the id
      var sourceParentId = tweet.referenced_tweets?.find(
        (reference) => reference.type === "replied_to"
      )?.id;

      return {
        sourceId,
        sourceParentId,
        text: tweet.text,
        textHtml: tweet.text_html,
        actor: tweet.user.screen_name,
        actorName: tweet.user.name,
        mentions,
        entities: [...entities, ...hashtags],
      };
    default:
      return {
        text: "",
        ...actorFields,
      };
  }
};

const getMember = ({ activity, included }) => {
  var memberId = activity.relationships.member.data.id;
  return included.find((item) => item.type === "member" && item.id == memberId);
};

const getAnyIdentity = ({ member, included }) => {
  const pointer = member.relationships.identities.data[0];
  return included.find((item) => item.id == pointer.id);
};

const getFields = ({ project, activity, included }) => {
  var sourceId = activity.id;
  var sourceType = activity.type;
  var timestamp = activity.attributes.occurred_at;

  // get the member to provide a global actor_identity for the activity
  // we do this to avoid any identity stitching on the client side
  var member = getMember({ activity, included });
  var { name, slug } = member.attributes;

  const { activity_link, properties } = activity.attributes;
  var typeFields = getTypeFields({ activity, member, included });

  if (!typeFields.actor) {
    console.log(member);
  }

  const fields = {
    timestamp,
    sourceId,
    sourceType,
    ...typeFields,
    globalActor: slug,
    globalActorName: name,
    projectId: project.id,
    tags: properties,
    url: activity_link,
    payload: {},
  };

  return fields;
};

const getAPIData = async ({
  url,
  apiKey,
  prisma,
  project,
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

      var records = [];

      for (let activity of activities) {
        var fields = getFields({ project, activity, included });
        records.push(fields);
      }

      // do a bulk insert for speed
      await prisma.activity.createMany({
        data: records,
      });

      console.log("Created activities: ", records.length);

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
            project,
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
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;
  const { id } = req.query;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        user: {
          email: user.email,
        },
      },
    });

    if (!project) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const apiKey = project.apiKey;
    const url = project.url;
    const allData = [];

    // delete existing activities for the project
    await prisma.activity.deleteMany({
      where: {
        projectId: project.id,
      },
    });

    await getAPIData({ url, apiKey, page: 1, allData, prisma, project });

    // for some reason the orbit API returned duplicate tweets, so we delete any
    // duplicates here before sending to graph-db
    let deletedCount =
      await prisma.$executeRaw`DELETE FROM public. "Activity" a USING public. "Activity" b WHERE a.id < b.id AND a."sourceId" = b."sourceId"`;
    console.log("Deleted " + deletedCount + " duplicate records");

    // now that all activities are inserted, connect the parents
    const activities = await prisma.activity.findMany({
      where: {
        projectId: project.id,
      },
    });
    for (let activity of activities) {
      if (activity.sourceParentId) {
        const parent = await prisma.activity.findFirst({
          where: { sourceId: activity.sourceParentId },
        });
        if (parent) {
          await prisma.activity.update({
            where: { id: activity.id },
            data: { parent: { connect: { id: parent.id } } },
          });
          console.log(
            `Connected activity ${activity.id} with parent ${parent.id}`
          );
        }
      }
    }

    res.status(200).json({ result: { count: allData.length } });
    console.log("Successfully imported activities");
  } catch (err) {
    console.log("Could not import activities", err);
    return res.status(500).json({ message: "Could not import activities" });
  }
}
