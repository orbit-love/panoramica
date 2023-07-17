import React from "react";
import TimeAgo from "react-timeago";
import { DateTime, Interval, Duration } from "luxon";

import c from "src/configuration/common";
import NameAndIcon from "src/components/domains/member/NameAndIcon";
import SourceIcon from "src/components/domains/activity/SourceIcon";

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
  timeDisplay,
}) {
  var { onClickMember, onClickChannel } = handlers;
  var member = community.findMemberByActivity(activity);
  var renderHtml = activity.textHtml?.length > 0;
  var { source, sourceChannel } = activity;

  var Timestamp = () => {
    var relativePart;
    if (Array.isArray(timeDisplay)) {
      var [parentTimestamp, timestamp] = timeDisplay;
      const duration = Interval.fromDateTimes(
        new Date(parentTimestamp),
        new Date(timestamp)
      ).toDuration(["weeks", "days", "hours", "minutes", "seconds"]);
      relativePart = duration
        .rescale()
        .toHuman({ milliseconds: false })
        .split(",")[0];
    }
    return (
      <>
        {relativePart && (
          <>
            <span>+{relativePart}</span>
            <span className="px-1">·</span>
          </>
        )}
        <TimeAgo
          date={activity.timestamp}
          title={c.formatDate(activity.timestamp)}
          activityId={activity.id}
        />
      </>
    );
  };
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
              <Timestamp />
            </a>
          )}
          {!activity.url && (
            <div className="text-indigo-700">
              <Timestamp />
            </div>
          )}
        </div>
      </div>
      {renderHtml && (
        <div className="text-sm text-indigo-200">
          <div
            className="a-html overflow-hidden break-words"
            dangerouslySetInnerHTML={{
              __html: highlightSearchTerm(activity.textHtml, term),
            }}
          ></div>
        </div>
      )}
      {!renderHtml && (
        <div className="overflow-hidden text-sm text-indigo-200 break-words">
          {highlightSearchTerm(activity.text, term)}
        </div>
      )}
    </div>
  );
}
