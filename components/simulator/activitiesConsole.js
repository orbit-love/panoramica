import React from "react";
import c from "lib/common";

function Activity({ activity, community, setSelection }) {
  return (
    <div
      key={activity.id}
      className="flex flex-col w-[500px] whitespace-nowrap"
    >
      <div className="flex items-baseline space-x-2">
        <button
          onClick={() => setSelection(community.findMemberByActor(activity))}
          className="max-w-32 overflow-hidden text-sm font-bold text-indigo-100 text-ellipsis"
        >
          {activity.actorName}
        </button>
        <div className="max-w-32 overflow-hidden text-sm text-orange-400 text-ellipsis">
          {activity.actor}
        </div>
        <div className="max-w-32 overflow-hidden text-sm text-green-500 text-ellipsis">
          {activity.sourceType?.replace(/_/g, " ").replace(/activity/, "")}
        </div>
        <div className="mx-auto" />
        <div className="flex-1 text-xs text-right">
          {activity.url && (
            <a
              className="text-indigo-700 underline"
              href={activity.url}
              target="_blank"
              rel="noreferrer"
            >
              {c.formatDate(activity.timestamp)}
            </a>
          )}
          {!activity.url && (
            <div className="text-indigo-700">
              {c.formatDate(activity.timestamp)}
            </div>
          )}
        </div>
      </div>
      {activity.textHtml && (
        <div className="flex mb-3 space-x-2 text-xs text-indigo-300 whitespace-normal">
          <div
            className="tweet"
            dangerouslySetInnerHTML={{ __html: activity.textHtml }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default function Console({ community, selection, setSelection }) {
  var activities = community.activities.filter(
    (activity) =>
      !selection ||
      selection.name === "Mission" ||
      selection.globalActor === activity.globalActor ||
      (selection.number &&
        community.findMemberByActor(activity)?.level === selection.number)
  );

  return (
    <div className="flex flex-col p-4 space-y-0">
      {activities.map((activity) => (
        <div key={activity.id} className="flex flex-col space-y-0">
          <Activity
            activity={activity}
            community={community}
            setSelection={setSelection}
          />
        </div>
      ))}
      {activities.length === 0 && (
        <div className="w-[450px] text-indigo-100">No activities.</div>
      )}
    </div>
  );
}
