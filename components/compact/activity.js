import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";

const SourceIcon = function ({ activity }) {
  let { source } = activity;
  switch (source) {
    case "twitter":
      return <FontAwesomeIcon icon="fa-brands fa-twitter" />;
    case "discord":
      return <FontAwesomeIcon icon="fa-brands fa-discord" />;
    case "github":
      return <FontAwesomeIcon icon="fa-brands fa-github" />;
    case "discourse":
      return <FontAwesomeIcon icon="fa-brands fa-discourse" />;
    default:
      let cleanedSourceType = activity.sourceType
        ?.replace(/_/g, " ")
        .replace(/activity/, "");
      return <span title={cleanedSourceType}>{activity.sourceType}</span>;
  }
};

export default function Activity({
  activity,
  community,
  selection,
  setSelection,
  setConnection,
}) {
  var member = community.findMemberByActivity(activity);
  var renderHtml = activity.textHtml?.length > 0;
  return (
    <div key={activity.id} className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2 text-sm">
        <NameAndIcon
          member={member}
          selection={selection}
          setConnection={setConnection}
          setSelection={setSelection}
        />
        <div className="overflow-hidden flex-1 text-xs text-right text-indigo-700 text-ellipsis">
          <SourceIcon activity={activity} />
        </div>
        <div className="text-xs text-right whitespace-nowrap">
          {activity.url && (
            <a
              className="text-indigo-700 hover:underline"
              href={activity.url}
              target="_blank"
              rel="noreferrer"
            >
              {c.formatDateShort(activity.timestamp)}
            </a>
          )}
          {!activity.url && (
            <div className="text-indigo-700">
              {c.formatDate(activity.timestamp)}
            </div>
          )}
        </div>
      </div>
      {renderHtml && (
        <div className="flex space-x-2 text-xs text-indigo-300">
          <div
            className="tweet overflow-hidden break-words"
            dangerouslySetInnerHTML={{ __html: activity.textHtml }}
          ></div>
        </div>
      )}
      {!renderHtml && (
        <div className="flex space-x-2 text-xs text-indigo-300 break-words">
          {activity.text}
        </div>
      )}
    </div>
  );
}
