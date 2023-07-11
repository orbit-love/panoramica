import React from "react";
import TimeAgo from "react-timeago";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";
import SourceIcon from "components/compact/source_icon";

function highlightSearchTerm(string, searchTerm) {
  if (searchTerm) {
    const searchWords = searchTerm.split(" ").filter(Boolean); // Split search term into individual words
    const regex = new RegExp(`\\b(${searchWords.join("|")})\\b`, "gi"); // Create regex with word boundaries
    return string.replace(regex, "<mark>$&</mark>");
  } else {
    return string;
  }
}

export default function Activity({
  activity,
  community,
  showSourceIcon,
  showSourceChannel,
  handlers,
  term,
}) {
  var { onClickMember, onClickChannel } = handlers;
  var member = community.findMemberByActivity(activity);
  var renderHtml = activity.textHtml?.length > 0;
  var { source, sourceChannel } = activity;
  return (
    <div key={activity.id} className="flex flex-col pb-2">
      <div className="flex items-center space-x-2">
        <NameAndIcon member={member} onClick={onClickMember} />
        <div className="flex-1" />
        {showSourceIcon && (
          <div className="flex overflow-hidden items-center space-x-1 text-xs text-right text-indigo-700 text-ellipsis whitespace-nowrap">
            <SourceIcon activity={activity} />
            {showSourceChannel && sourceChannel && (
              <button
                className="hover:underline"
                onClick={(e) => onClickChannel(e, source, sourceChannel)}
              >
                {c.displayChannel(sourceChannel)}
              </button>
            )}
          </div>
        )}
        <div className="text-xs text-right whitespace-nowrap">
          {activity.url && (
            <a
              className="text-indigo-700 hover:underline"
              href={activity.url}
              target="_blank"
              rel="noreferrer"
            >
              <TimeAgo date={activity.timestamp} />
            </a>
          )}
          {!activity.url && (
            <div className="text-indigo-700">
              <TimeAgo date={activity.timestamp} />
            </div>
          )}
        </div>
      </div>
      {renderHtml && (
        <div className="text-sm text-indigo-300">
          <div
            className="a-html overflow-hidden break-words"
            dangerouslySetInnerHTML={{
              __html: highlightSearchTerm(activity.textHtml, term),
            }}
          ></div>
        </div>
      )}
      {!renderHtml && (
        <div className="overflow-hidden text-sm text-indigo-300 break-words">
          {highlightSearchTerm(activity.text, term)}
        </div>
      )}
    </div>
  );
}
