import React from "react";
import c from "lib/common";

function Activity({ activity, community, setSelection }) {
  return (
    <div key={activity.id} className="flex flex-col">
      <div className="flex items-baseline space-x-2">
        <button
          onClick={() => setSelection(community.findMemberByActivity(activity))}
          className="overflow-hidden text-sm font-bold text-indigo-100 text-ellipsis whitespace-nowrap"
        >
          {activity.actorName}
        </button>
        <div className="overflow-hidden text-sm text-orange-400 text-ellipsis">
          {activity.actor}
        </div>
        <div className="overflow-hidden text-sm text-green-500 text-ellipsis">
          {activity.sourceType?.replace(/_/g, " ").replace(/activity/, "")}
        </div>
        <div className="mx-auto" />
        <div className="flex-1 text-xs text-right whitespace-nowrap">
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
        <div className="flex mb-3 space-x-2 text-xs text-indigo-300">
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
        community.findMemberByActivity(activity)?.level === selection.number)
  );

  return (
    <div className="flex overflow-scroll flex-col space-y-0">
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
        <div className="text-indigo-100">No activities.</div>
      )}
    </div>
  );
}
