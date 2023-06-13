import React from "react";
import classnames from "classnames";
import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

function Activity({ activity, community, setSelection }) {
  const member = community.findMemberByActivity(activity);
  const color = c.orbitLevelColorScale(member.level);
  return (
    <div key={activity.id} className="flex flex-col">
      <div className="flex items-baseline space-x-2">
        <button
          onClick={() => setSelection(member)}
          className="flex overflow-hidden items-center space-x-1 text-sm font-bold text-indigo-100 text-ellipsis whitespace-nowrap hover:underline"
          style={{ color }}
        >
          <OrbitLevelIcon number={member.level} classes="" />
          <div>{member.globalActorName || member.actorName}</div>
        </button>
        <div className="overflow-hidden flex-1 text-xs text-right text-indigo-700 text-ellipsis">
          {activity.sourceType?.replace(/_/g, " ").replace(/activity/, "")}
        </div>
        <div className="text-xs text-right whitespace-nowrap">
          {activity.url && (
            <a
              className="text-indigo-700 hover:underline"
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
        <div className="flex space-x-2 text-xs text-indigo-300">
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
      {activities.slice(0, 100).map((activity, index) => (
        <div
          key={activity.id}
          className={classnames("flex flex-col space-y-0 px-4 py-3", {
            "bg-indigo-900": index % 2 === 1,
            "bg-opacity-30": index % 2 === 1,
          })}
        >
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
