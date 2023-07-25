import React from "react";
import TimeAgo from "react-timeago";
import { Interval } from "luxon";

import utils from "src/utils";
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
    return (
      <TimeAgo
        date={activity.timestamp}
        title={utils.formatDate(activity.timestamp)}
      />
    );
  };

  var Since = () => {
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
      </>
    );
  };
  return (
    <div
      key={activity.id}
      data-activity-id={activity.id}
      className="flex flex-col py-1 space-y-1"
    >
      <div className="flex items-center space-x-2">
        <NameAndIcon member={member} onClick={onClickMember} />
        <div className="flex-1" />
        {showSourceIcon && (
          <div className="text-secondary flex overflow-hidden items-center space-x-1 text-sm text-right text-ellipsis whitespace-nowrap">
            <SourceIcon activity={activity} />
            {showSourceChannel && sourceChannel && (
              <button
                className="hover:underline"
                onClick={(e) => onClickChannel(e, source, sourceChannel)}
              >
                {utils.displayChannel(sourceChannel)}
              </button>
            )}
          </div>
        )}
        <div className="text-secondary text-sm text-right whitespace-nowrap">
          <Since />
          {activity.url && (
            <a
              className="hover:underline"
              href={activity.url}
              target="_blank"
              rel="noreferrer"
            >
              <Timestamp />
            </a>
          )}
          {!activity.url && <Timestamp />}
        </div>
      </div>
      {renderHtml && (
        <div
          className="a-html overflow-hidden break-words"
          dangerouslySetInnerHTML={{
            __html: highlightSearchTerm(activity.textHtml, term),
          }}
        ></div>
      )}
      {!renderHtml && (
        <div className="overflow-hidden break-words">
          {highlightSearchTerm(activity.text, term)}
        </div>
      )}
    </div>
  );
}
