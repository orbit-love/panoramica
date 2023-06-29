import { remark } from "remark";
import remarkGithub from "remark-github";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import { prisma } from "lib/db";
import c from "lib/common";
import axios from "axios";

export function getAPIUrl({ workspace, timeframe = "relative=this_90_days" }) {
  // only conversational activity types with referenced tweets, 90 days default
  let queryString = `activity_type=discord%3Amessage%3Asent%2Cdiscord%3Amessage%3Areplied%2Cdiscord%3Athread%3Areplied%2Cissue_comment%3Acreated%2Cissues%3Aopened%2Cpull_requests%3Aopened%2Ctweet%3Asent&include_referenced_activities=true&${timeframe}`;
  return `https://app.orbit.love/${workspace}/activities.json?${queryString}`;
}

const getTweetFields = ({ activity }) => {
  const tweet = activity.attributes.t_tweet;
  const sourceId = tweet.id_str;
  const source = "twitter";
  // pull out the strings for the mentions and annotations
  const mentions = (
    tweet.entities.mentions || tweet.entities.user_mentions
  ).map((mention) => mention.username || mention.screen_name);
  const entities = (tweet.entities.annotations || [])
    ?.map((annotation) => annotation.normalized_text)
    ?.map((text) => text.toLowerCase());
  const hashtags = c.getHashtags(tweet.text).map((text) => text.toLowerCase());
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
  let { key, body, body_html, properties, referenced_activities } =
    activity.attributes;
  let { discord_channel } = properties;
  let sourceId = key;
  let source = "discord";
  let sourceParentId = referenced_activities?.find(
    (refActivity) => !!refActivity.key
  )?.key;
  // if the parent is the same as the activity, skip it; this seems
  // to be an odd case related to forum channels
  if (sourceId === sourceParentId) {
    sourceParentId = null;
  }

  // once we have the text, we can update this
  // we need body_html as body does not have the mentions substituted
  let mentions = c.getMentions(body_html);
  let entities = [];
  let actor;
  let actorName;
  let sourceChannel = discord_channel;

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

  let text = body || "";
  let textHtml = body_html || "";

  return {
    sourceId,
    sourceParentId,
    source,
    sourceChannel,
    text,
    textHtml,
    actor,
    actorName,
    mentions,
    entities,
  };
};

const getDiscourseFields = ({ activity, sourceType, member, included }) => {
  let { key, body, body_html, properties, activity_link, d_title } =
    activity.attributes;
  let { discourse_host, discourse_category } = properties;
  let sourceId = key;
  let source = "discourse";

  // only posts have a potential parent, not topics
  // for now a post's parent is the topic
  // ultimately better to use referenced_activities
  let sourceParentId;
  if (sourceType === "discourse_post_activity") {
    let topicNumber = activity_link.split("/").slice(-2, -1);
    // restore the dots in the discourse host name
    discourse_host = discourse_host.replaceAll("-", ".");
    sourceParentId = `${discourse_host}/topic/#${topicNumber}`;
  }
  if (sourceType === "discourse_topic_activity") {
    body = d_title;
    body_html = d_title;
  }

  // parse out mentions
  let mentions = c.getMentions(body);
  let entities = [];
  let actor;
  let actorName;
  let sourceChannel = discourse_category;

  let discourseIdentity = getIdentity({
    type: "discourse_identity",
    member,
    included,
  });
  if (discourseIdentity) {
    let { username, name } = discourseIdentity.attributes;
    actor = username;
    actorName = name || username;
  }

  let text = body || "";
  let textHtml = body_html || "";

  return {
    sourceId,
    sourceParentId,
    source,
    sourceChannel,
    text,
    textHtml,
    actor,
    actorName,
    mentions,
    entities,
  };
};

const getGitHubFields = async ({ activity, member, included }) => {
  let { key, g_body, g_title, g_number, properties } = activity.attributes;
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

  let repository = properties["github_repository"];
  let sourceChannel = repository;

  // parse out any mentions
  let mentions = c.getMentions(g_body);
  let entities = [];
  let actor;
  let actorName;

  if (g_title) {
    g_title = `#${g_number}: ${g_title}`;
  }

  let bodyHtml = "";
  if (g_body) {
    let doc = await remark()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGithub, { repository, mentionStrong: false })
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(g_body);
    bodyHtml = String(doc);
  }

  let text = "",
    textHtml = "";
  if (g_title) {
    text = [g_title, g_body].filter((e) => e).join("—");
    textHtml = `<div>${g_title}</div>${bodyHtml}`;
  } else if (g_body) {
    text = g_body;
    textHtml = bodyHtml;
  }

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
    sourceChannel,
    text,
    textHtml,
    actor,
    actorName,
    mentions,
    entities,
  };
};

const getTypeFields = async (props) => {
  const { sourceType } = props;
  switch (sourceType) {
    // set actor and actor_name to the local version where possible
    // actor should be the username or equivalent
    case "tweet_activity":
      return getTweetFields(props);
    case "discord_message_sent_activity":
    case "discord_thread_replied_activity":
    case "discord_message_replied_activity":
      return getDiscordFields(props);
    case "discourse_post_activity":
    case "discourse_topic_activity":
      return getDiscourseFields(props);
    case "issue_activity":
    case "pull_request_activity":
    case "issue_comment_activity":
    case "fork_activity":
      return await getGitHubFields(props);
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

const getFields = async ({ project, activity, included }) => {
  var sourceId = activity.id;
  var sourceType = activity.type;
  var timestamp = activity.attributes.occurred_at;

  // get the member to provide a global actor_identity for the activity
  // we do this to avoid any identity stitching on the client side
  var member = getMember({ activity, included });
  var { name, slug } = member.attributes;

  const { activity_link, properties } = activity.attributes;
  var typeFields = await getTypeFields({
    activity,
    sourceType,
    member,
    included,
  });

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

export const getAPIData = async ({
  url,
  apiKey,
  project,
  page = 1,
  pageLimit = 20,
  handleRecords,
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
        var fields = await getFields({ project, activity, included });
        records.push(fields);
      }

      // if needed, deduping by sourceId (within the batch at least) could go before this
      // the call determines what to do with the fetched records
      await handleRecords(records);

      // add activities to the final array
      allData.push(...activities);

      // This assumes that the API returns a JSON object with a 'nextPage' property
      // that is null when there are no more pages.
      var nextUrl = response.data.links?.next;
      if (nextUrl && page < pageLimit) {
        resolve(
          getAPIData({
            url: nextUrl,
            apiKey,
            prisma,
            project,
            page: page + 1,
            allData,
            handleRecords,
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
