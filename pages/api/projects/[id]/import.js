import { prisma } from "lib/db";
import axios from "axios";
import { check, redirect, authorizeProject } from "lib/auth";
import c from "lib/common";

const getTweetFields = ({ activity }) => {
  const tweet = activity.attributes.t_tweet;
  const sourceId = tweet.id_str;
  const source = "twitter";
  // pull out the strings for the mentions and annotations
  const mentions = (
    tweet.entities.mentions || tweet.entities.user_mentions
  ).map((mention) => mention.username || mention.screen_name);
  const entities = (tweet.entities.annotations || [])?.map(
    (annotation) => annotation.normalized_text
  );
  const hashtags = c.getHashtags(tweet.text);
  // look to see if the tweet is a reply and grab the id
  var sourceParentId = tweet.referenced_tweets?.find(
    (reference) => reference.type === "replied_to"
  )?.id;

  return {
    sourceId,
    sourceParentId,
    source,
    text: tweet.text,
    textHtml: tweet.text_html,
    actor: tweet.user.screen_name,
    actorName: tweet.user.name,
    mentions,
    entities: [...entities, ...hashtags],
  };
};

const getDiscordFields = ({ activity, member, included }) => {
  let { key, referenced_activities } = activity.attributes;
  let sourceId = key;
  let source = "discord";
  let sourceParentId = referenced_activities?.find(
    (refActivity) => !!refActivity.key
  )?.key;

  // once we have the text, we can update this
  let mentions = [];
  let entities = [];
  let actor;
  let actorName;

  let discordIdentity = getIdentity({
    type: "discord_identity",
    member,
    included,
  });
  if (discordIdentity) {
    let { username, name } = discordIdentity.attributes;
    actor = username;
    actorName = name || username;
  }

  let text = `${actorName} said something...`;

  return {
    sourceId,
    sourceParentId,
    source,
    text,
    actor,
    actorName,
    mentions,
    entities,
  };
};

const getGitHubFields = ({ activity, member, included }) => {
  let { key, g_body, g_title, g_number } = activity.attributes;
  let sourceId = key;
  let source = "github";
  let sourceParentId;

  // orbit-love/orbit-browser-extension#67-1593362322
  if (activity.type === "issue_comment_activity") {
    let parts = key.split("-");
    // Remove the last part
    parts.pop();
    // Rejoin the first parts
    sourceParentId = parts.join("-");
  }

  // parse out any mentions
  let mentions = c.getMentions(g_body);
  let entities = [];
  let actor;
  let actorName;

  if (g_title) {
    g_title = `#${g_number}: ${g_title}`;
  }

  let text = [g_title, g_body].filter((e) => e).join("—");

  let githubIdentity = getIdentity({
    type: "github_identity",
    member,
    included,
  });
  if (githubIdentity) {
    let { username, name } = githubIdentity.attributes;
    actor = username;
    actorName = name || username;
  }

  return {
    sourceId,
    sourceParentId,
    source,
    text,
    actor,
    actorName,
    mentions,
    entities,
  };
};

const getTypeFields = ({ activity, member, included }) => {
  // the goal though is to pull the actor id from the platform
  const props = { activity, member, included };
  switch (activity.type) {
    // set actor and actor_name to the local version where possible
    // actor should be the username or equivalent
    case "tweet_activity":
      return getTweetFields(props);
    case "discord_message_sent_activity":
    case "discord_thread_replied_activity":
    case "discord_message_replied_activity":
      return getDiscordFields(props);
    case "issue_activity":
    case "pull_request_activity":
    case "issue_comment_activity":
    case "fork_activity":
      return getGitHubFields(props);
    default:
      return {};
  }
};

const getMember = ({ activity, included }) => {
  var memberId = activity.relationships.member.data.id;
  return included.find((item) => item.type === "member" && item.id == memberId);
};

const getIdentity = ({ type, member, included }) => {
  const identities = member.relationships.identities.data;
  const identity = identities.find((identity) => identity.type === type);
  if (identity) {
    return included.find(
      (item) => item.type === type && item.id === identity.id
    );
  } else {
    return null;
  }
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

  // if no actor was found, use the global member information
  if (!typeFields.actor) {
    typeFields.actor = member.attributes.slug;
    typeFields.actorName = member.attributes.name || member.attributes.slug;
  }

  // set a default for text that should be overridden
  let text = "";

  const fields = {
    timestamp,
    sourceId,
    sourceType,
    text,
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
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }

  const { id } = req.query;

  try {
    var project = await authorizeProject({ id, user, res });
    if (!project) {
      return;
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
    // this really may not be necessary and could be super slow
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
