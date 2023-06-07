import React from "react";

import c from "lib/common";

export default function Infer({ activities, low, high }) {
  var slice = activities?.slice(low, high) || [];

  const tweet = (activity) => activity.payload.attributes.t_tweet;

  return (
    <div
      className={`absolute top-0 left-96 ml-6 z-50 flex items-center justify-center bg-[${c.backgroundColor}] bg-opacity-70`}
    >
      <div
        className="relative bg-[#150d33] pr-2 rounded-md border-2 border-indigo-600 overflow-scroll"
        style={{ width: "50vw", height: "45vh" }}
      >
        <div className="flex flex-col p-4 space-y-3">
          {slice.map((activity) => (
            <div key={activity.id} className="flex flex-col">
              <div className="flex space-x-2">
                <div className="font-bold">{tweet(activity).user.name}</div>
                <div className="text-violet-300">
                  {"@" + tweet(activity).user.screen_name}
                </div>
                <div className="mx-auto" />
                <div className="flex-1 text-sm text-right text-indigo-500">
                  {c.formatDate(activity.timestamp)}
                </div>
              </div>
              <div className="flex space-x-2">
                {(tweet(activity).entities.mentions || []).map((mention) => (
                  <div className="text-purple-500" key={mention.username}>
                    @{mention.username}
                  </div>
                ))}
                {(tweet(activity).entities.annotations || []).map(
                  (annotation) => (
                    <div
                      className="text-orange-400"
                      key={annotation.normalized_text}
                    >
                      {`:${annotation.normalized_text}`}
                    </div>
                  )
                )}
              </div>
              <div className="flex space-x-2 text-sm">
                {tweet(activity).text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
