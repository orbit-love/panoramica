import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";

export default function Activity({
  activity,
  community,
  selection,
  setSelection,
  setConnection,
}) {
  const member = community.findMemberByActivity(activity);
  return (
    <div key={activity.id} className="flex flex-col">
      <div className="flex items-center space-x-2 text-sm">
        <NameAndIcon
          member={member}
          selection={selection}
          setConnection={setConnection}
          setSelection={setSelection}
        />
        <div className="overflow-hidden flex-1 text-xs text-right text-indigo-700 text-ellipsis">
          {activity.sourceType === "tweet_activity" ? (
            <FontAwesomeIcon icon="fa-brands fa-twitter" />
          ) : (
            activity.sourceType?.replace(/_/g, " ").replace(/activity/, "")
          )}
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
