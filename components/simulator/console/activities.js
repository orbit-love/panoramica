import React from "react";
import classnames from "classnames";
import c from "lib/common";
import OrbitLevelIcon from "components/icons/orbit_level";

function Activity({ activity, community, setSelection }) {
  const member = community.findMemberByActivity(activity);
  const color = c.orbitLevelColorScale(member.level);
  return (
    <div key={activity.id} className="flex flex-col">
      <div className="flex items-center space-x-2">
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

export default function Console({
  community,
  selection,
  setSelection,
  connection,
}) {
  var activities = community.activities;
  var title;

  // if it's a member
  if (selection?.actor) {
    if (connection) {
      // first get the activities that they both did
      activities = activities.filter(
        (activity) =>
          activity.globalActor === selection.globalActor ||
          activity.globalActor === connection.globalActor
      );
      // now filter out for mentions
      activities = activities.filter(
        (activity) =>
          (activity.globalActor === selection.globalActor &&
            activity.mentions.indexOf(connection.actor) > -1) ||
          (activity.globalActor === connection.globalActor &&
            activity.mentions.indexOf(selection.actor) > -1)
      );
      title = `${selection.globalActorName} <> ${connection.globalActorName}`;
    } else {
      activities = activities.filter(
        (activity) => activity.globalActor === selection.globalActor
      );
      title = selection.globalActorName;
    }
    // it's an orbit level
  } else if (selection?.number) {
    activities = activities.filter(
      (activity) =>
        community.findMemberByActivity(activity)?.level === selection.number
    );
    title = `Orbit ${selection.number}`;
  }

  return (
    <div className="flex overflow-scroll flex-col space-y-2 w-full">
      <div className="flex items-baseline px-4 pt-4 space-x-2 whitespace-nowrap">
        <span className="text-lg font-bold text-ellipsis">Activities</span>
        <span className="overflow-hidden flex-1 text-sm text-right text-indigo-500 text-ellipsis">
          {title}
        </span>
      </div>
      <div className="mx-4 border-b border-indigo-900" />
      {activities.slice(0, 100).map((activity, index) => (
        <div
          key={activity.id}
          className={classnames("flex flex-col space-y-0 px-4 py-2", {
            "bg-indigo-900": index % 2 === 1,
            "bg-opacity-20": index % 2 === 1,
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
        <div className="py-3 px-4 text-indigo-500">No activities.</div>
      )}
    </div>
  );
}
