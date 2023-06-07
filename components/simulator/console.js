import React from "react";
import c from "lib/common";
import nlp from "compromise/three";

const tweet = (activity) => activity.payload.attributes.t_tweet;

class Inference {
  constructor({
    source,
    sourceRole,
    topic,
    target,
    targetRole,
    timestamp,
    activityId,
  }) {
    this.source = source;
    this.sourceRole = sourceRole;
    this.topic = topic;
    this.target = target;
    this.targetRole = targetRole;
    this.timestamp = timestamp;
    this.activityId = activityId;
  }
}

const mentions = function (tweet) {
  return tweet.entities.mentions || tweet.entities.user_mentions;
};

const inferences = function ({ activity }) {
  let tw = tweet(activity);
  if (!tw) return [];

  const source = tw.user.screen_name;
  const topics2 = topics(tw.text);
  if (topics2.length === 0) {
    topics2.push("none");
  }

  const theMentions = mentions(tw).map(
    (mention) => mention.username || mention.screen_name
  );

  const result = [];

  topics2.forEach((topic) => {
    theMentions.forEach((mention) => {
      result.push(
        new Inference({
          source,
          target: mention,
          timestamp: activity.timestamp,
          activityId: activity.id,
          topic,
        })
      );
    });
  });

  return result;
};

function isUpperCase(str) {
  return str[0] === str[0].toUpperCase();
}

function topics(text) {
  const doc = nlp(text);
  return doc
    .nouns()
    .normalize()
    .toSingular()
    .unique()
    .out("array")
    .filter((term) => {
      if (
        term.indexOf("@") > -1 ||
        term.length < 5 ||
        !isUpperCase(term) ||
        term.split(/\s/).length > 1
      ) {
        return false;
      }
      return true;
    })
    .map((term) => term.replace(/\W/g, ""));
}

function Activity({ activity }) {
  const tw = tweet(activity);
  return (
    <div key={activity.id} className="flex flex-col">
      <div className="flex space-x-2">
        <div className="font-bold">{tw.user.name}</div>
        <div className="text-violet-300">
          {"@" + tweet(activity).user.screen_name}
        </div>
        <div className="mx-auto" />
        <div className="flex-1 text-sm text-right text-indigo-500">
          {c.formatDate(activity.timestamp)}
        </div>
      </div>
      <div className="flex flex-wrap space-x-2">
        {topics(tw.text).map((topic) => (
          <div key={topic} className="text-red-500 underline">
            {topic}
          </div>
        ))}
      </div>
      <div className="flex space-x-2 text-sm">{tw.text}</div>
    </div>
  );
}

export default function Console({ activities, low, high }) {
  var slice = activities.slice(low, high) || [];
  var inferences2 = slice.map((activity) => inferences({ activity })).flat();
  if (inferences2.length === 0) {
    return <></>;
  }
  var topicMap = {};
  var peopleMap = {};
  inferences2.forEach(({ source, target, topic }) => {
    var key = `${source} → ${target} · ${topic}`.replace(/· none/, "");
    var entry = peopleMap[key];
    if (entry) {
      peopleMap[key] = entry + 1;
    } else {
      peopleMap[key] = 1;
    }

    var entry = topicMap[topic];
    if (entry) {
      topicMap[topic] = entry + 1;
    } else {
      topicMap[topic] = 1;
    }
  });

  return (
    <div
      className={`absolute top-0 left-96 ml-6 z-50 flex items-center justify-center bg-[${c.backgroundColor}] bg-opacity-70`}
    >
      <div
        className="relative bg-[#150d33] pr-2 rounded-md border-2 border-indigo-600 overflow-scroll"
        style={{ width: "50vw", height: "45vh" }}
      >
        <div className="flex flex-col p-4 space-y-0">
          {Object.entries(topicMap)
            .sort((a, b) => b[1] - a[1])
            .filter(([k, _]) => k !== "none")
            .map(([k, v]) => (
              <div className="flex space-x-2 text-green-500" key={k}>
                <div>{k}</div>
                <div>{v}</div>
              </div>
            ))}
          {Object.entries(peopleMap)
            .sort((a, b) => b[1] - a[1])
            .filter(([k, _]) => k !== "none")
            .map(([k, v]) => (
              <div className="flex space-x-2 text-orange-500" key={k}>
                <div>{k}</div>
                <div>{v}</div>
              </div>
            ))}
          {false &&
            slice.map((activity) => (
              <div key={activity.id} className="flex flex-col space-y-0">
                <Activity activity={activity} />
                {inferences({ activity }).map((inference) => (
                  <div
                    className="flex-inline space-x-1"
                    key={JSON.stringify(inference)}
                  >
                    <span className="text-green-500">{inference.source}</span>
                    <span>to</span>
                    <span className="text-green-500">{inference.target}</span>
                    {inference.topic && inference.topic !== "none" && (
                      <>
                        <span>about</span>
                        <span className="text-red-500">{inference.topic}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
