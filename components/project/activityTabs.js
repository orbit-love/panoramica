import React, { useState } from "react";
import classnames from "classnames";

import Feed from "lib/community/feed";
import FeedComponent from "components/console/feed";
import SourceIcon from "components/compact/source_icon";

export default function ActivityTabs(props) {
  var [source, setSource] = useState(null);

  var feed = new Feed(props);
  var activities = feed.getFilteredActivities();
  var sources = feed.getSources({ activities });

  // if a source is active but there are no activities to match it
  // clear it out - this can happen e.g. when a member's connection
  // if selected
  if (source && sources.indexOf(source) === -1) {
    setSource(null);
  }

  // filter by source
  activities = activities.filter(
    (activity) => !source || source === activity.source
  );

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex items-baseline px-4 pt-4 space-x-1">
        <span className="text-lg font-bold">Activities</span>
        <span className="px-1 font-normal text-indigo-500">
          {activities.length}
        </span>
        <span className="flex-grow !mx-auto"></span>
        <div className="flex items-baseline space-x-3">
          {sources.map((_source) => (
            <button
              key={_source}
              onClick={() =>
                _source === source ? setSource(null) : setSource(_source)
              }
              title={_source}
            >
              <div
                className={classnames({
                  "text-indigo-700 hover:text-indigo-600": source !== _source,
                  "text-indigo-400": source === _source,
                })}
              >
                <SourceIcon activity={{ source: _source }} />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="border-b border-indigo-900 !mb-0" />
      <FeedComponent {...props} activities={activities} />
    </div>
  );
}
