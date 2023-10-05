import { remark } from "remark";
import remarkGithub from "remark-github";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import axios from "axios";

const getMentions = function (text) {
  let mentions = text?.match(/@\w+/g);
  if (mentions) {
    // Remove the @ character from the mentions and de-duplicate
    let uniqueMentions = [
      ...new Set(mentions.map((mention) => mention.substring(1))),
    ];
    return uniqueMentions;
  } else {
    // Return an empty array if there were no mentions
    return [];
  }
};

export function getAPIUrl({ workspace, timeframe = "", items = 100 }) {
  // list of conversational activity types to fetch from orbit
  let activityTypes = [
    "discord:message:sent",
    "discord:message:replied",
    "discord:thread:replied",
    "issue_comment:created",
    "issues:opened",
    "pull_requests:opened",
    "tweet:sent",
    "slack:message:sent",
    "slack:thread:replied",
    "discussions:comment",
    "discussions:reply",
    "discussions:discussion_created",
  ];

  let activityTypeStr = activityTypes.join("%2C");
  // only conversational activity types with referenced tweets
  let queryString = `activity_type=${activityTypeStr}&include_referenced_activities=true&items=${items}${timeframe}`;
  return `https://app.orbit.love/${workspace}/activities.json?${queryString}`;
}

const getTweetFields = ({ activity }) => {
  const tweet = activity.attributes.t_tweet;
  const sourceId = tweet.id_str;
  const source = "twitter";
  // pull out the strings for the mentions and annotations
  const mentions = (
    tweet.entities?.mentions || tweet.entities?.user_mentions
  )?.map((mention) => mention.username || mention.screen_name);
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
  };
};

const getDiscordFields = async ({ activity, member, included }) => {
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

  let mentions = getMentions(body_html);
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

  if (body_html) {
    let doc = await remark()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(body_html);
    textHtml = String(doc);
  }

  // turn any anchor tags that are just links to images into img tags
  function replaceAnchorWithImageTags(htmlString) {
    const pattern =
      /<a[^>]*href=["'](http[s]?:\/\/[^"\s]+(\.(png|jpg|jpeg|gif|bmp)))["'][^>]*>(.*?)<\/a>/gi;
    const newHtmlString = htmlString.replace(
      pattern,
      '<img src="$1" alt="Discord image" />'
    );
    return newHtmlString;
  }

  textHtml = replaceAnchorWithImageTags(textHtml);

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
  };
};

const getSlackFields = async ({ activity, member, included }) => {
  let { key, body, body_html, properties, referenced_activities } =
    activity.attributes;
  let { slack_channel } = properties;
  let sourceId = key;
  let source = "slack";
  let sourceParentId = referenced_activities?.find(
    (refActivity) => !!refActivity.key
  )?.key;

  let mentions = getMentions(body_html);
  let actor;
  let actorName;
  let sourceChannel = slack_channel;

  let slackIdentity = getIdentity({
    type: "slack_identity",
    member,
    included,
  });
  if (slackIdentity) {
    let { username, name } = slackIdentity.attributes;
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
  let mentions = getMentions(body);
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
  let mentions = getMentions(g_body);
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
    textHtml = `<p><strong>${g_title}</strong></p>${bodyHtml}`;
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
  };
};

const getDiscussionsFields = async ({ activity, member, included }) => {
  let { key, body, g_title, properties, referenced_activities } =
    activity.attributes;
  let sourceId = key;
  let source = "discussions";
  let sourceParentId;

  // community/community/discussions/69167#discussioncomment-7195885
  if (
    activity.type === "github_discussion_comment_activity" ||
    activity.type === "github_discussion_comment_reply_activity"
  ) {
    sourceParentId = referenced_activities?.find(
      (refActivity) => !!refActivity.key
    )?.key;
  }

  let repository = properties["github_repository"];
  let sourceChannel = repository;

  // parse out any mentions
  let mentions = getMentions(body);
  let actor;
  let actorName;

  let bodyHtml = "";
  if (body) {
    let doc = await remark()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkGithub, { repository, mentionStrong: false })
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(body);
    bodyHtml = String(doc);
  }

  // only the top-level activity has a title; for that, add it
  let text = "",
    textHtml = "";
  if (g_title) {
    text = [g_title, body].filter((e) => e).join("—");
    textHtml = `<p><strong>${g_title}</strong></p>${bodyHtml}`;
  } else if (body) {
    text = body;
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
    case "github_discussion_activity":
    case "github_discussion_comment_activity":
    case "github_discussion_comment_reply_activity":
      return await getDiscussionsFields(props);
    case "slack_thread_replied_activity":
    case "slack_message_sent_activity":
      return await getSlackFields(props);
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

const getFields = async ({ activity, included }) => {
  var sourceId = activity.id;
  var sourceType = activity.type;
  var timestamp = activity.attributes.occurred_at;
  var timestampInt = Date.parse(activity.attributes.occurred_at);

  // get the member to provide a global actor_identity for the activity
  // we do this to avoid any identity stitching on the client side
  var member = getMember({ activity, included });
  var { name, slug, avatar_url: globalActorAvatar } = member.attributes;

  const { activity_link, properties } = activity.attributes;
  var typeFields = await getTypeFields({
    activity,
    sourceType,
    member,
    included,
  });

  // if no actor was found, use the global member information
  if (!typeFields.actor) {
    typeFields.actor = slug;
    typeFields.actorName = name || slug;
  }

  const globalActor = slug;
  const globalActorName = name || slug;

  // default text should be overridden by typeFields
  let text = "";

  const fields = {
    timestamp,
    timestampInt,
    sourceId,
    sourceType,
    text,
    ...typeFields,
    globalActor,
    globalActorName,
    globalActorAvatar,
    tags: properties,
    url: activity_link,
  };

  return fields;
};

export const fetchActivitiesPage = async ({ url, apiKey }) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const orbitActivities = response.data.data;
    const included = response.data.included;

    const activities = [];
    for (let orbitActivity of orbitActivities) {
      activities.push(await getFields({ activity: orbitActivity, included }));
    }

    var nextUrl = response.data.links?.next;
    return {
      nextUrl,
      activities,
    };
  } catch (error) {
    console.log("Orbit API: Failed to fetch data", error);
    throw error;
  }
};
