import React from "react";

import c from "lib/common";
import NameAndIcon from "components/compact/name_and_icon";
import SourceIcon from "components/compact/source_icon";

export default function Activity({
  activity,
  community,
  selection,
  setSelection,
  setConnection,
  showSourceIcon,
  onClickMember,
}) {
  var member = community.findMemberByActivity(activity);
  var renderHtml = activity.textHtml?.length > 0;
  return (
    <div key={activity.id} className="flex flex-col pb-2">
      <div className="flex items-center space-x-2">
        <NameAndIcon
          member={member}
          selection={selection}
          setConnection={setConnection}
          setSelection={setSelection}
          onClick={onClickMember}
        />
        <div className="flex-1" />
        {showSourceIcon && (
          <div className="flex overflow-hidden items-center space-x-1 text-xs text-right text-indigo-700 text-ellipsis whitespace-nowrap">
            <SourceIcon activity={activity} />
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
        <div className="text-sm text-indigo-300">
          <div
            className="a-html overflow-hidden break-words"
            dangerouslySetInnerHTML={{ __html: activity.textHtml }}
          ></div>
        </div>
      )}
      {!renderHtml && (
        <div className="overflow-hidden text-sm text-indigo-300 break-words">
          {activity.text}
        </div>
      )}
    </div>
  );
}
