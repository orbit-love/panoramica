import React from "react";
import c from "lib/common";

const tweet = (activity) => activity.payload.attributes.t_tweet;

const findMember = (activity, members) =>
  members.list.find((member) => member.name === activity.actor);

function Activity({ activity, members, setSelection }) {
  const tw = tweet(activity);
  return (
    <div
      key={activity.id}
      className="flex flex-col w-[450px] whitespace-nowrap"
    >
      <div className="flex items-baseline space-x-2">
        <button
          onClick={() => setSelection(findMember(activity, members))}
          className="max-w-32 overflow-hidden text-sm font-bold text-indigo-100 text-ellipsis"
        >
          {tw.user.name}
        </button>
        <div className="text-sm text-orange-400 hover:underline">
          <a
            href={`https://twitter.com/${tw.user.screen_name}`}
            target="_blank"
            rel="noreferrer"
          >
            {"@" + tw.user.screen_name}
          </a>
        </div>
        <div className="mx-auto" />
        <div className="flex-1 text-xs text-right text-indigo-500">
          <a href={activity.link} target="_blank" rel="noreferrer">
            {c.formatDate(activity.timestamp)}
          </a>
        </div>
      </div>
      <div className="flex space-x-2 text-xs text-indigo-300 whitespace-normal">
        <div
          className="tweet"
          dangerouslySetInnerHTML={{ __html: tw.text_html }}
        ></div>
      </div>
    </div>
  );
}

export default function Console({
  activities,
  members,
  low,
  high,
  selection,
  setSelection,
}) {
  var slice = activities.slice(low, high) || [];

  slice = slice
    .reverse()
    .filter(
      (activity) =>
        !selection ||
        selection.name === "Mission" ||
        selection.name === activity.actor ||
        (selection.number &&
          findMember(activity, members)?.level === selection.number)
    );

  return (
    <div className="flex flex-col p-4 space-y-4">
      {slice.map((activity) => (
        <div key={activity.id} className="flex flex-col space-y-0">
          <Activity
            activity={activity}
            members={members}
            setSelection={setSelection}
          />
        </div>
      ))}
      {slice.length === 0 && (
        <div className="w-[450px] text-indigo-100">No activities.</div>
      )}
    </div>
  );
}
